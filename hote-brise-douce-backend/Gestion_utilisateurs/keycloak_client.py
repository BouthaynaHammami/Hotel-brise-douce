"""
keycloak_client.py
------------------
Handles communication with the Keycloak Admin REST API.

Config is loaded from environment variables (or a .env file via python-dotenv).
Required env vars — add them to a `.env` file in this folder:

    KEYCLOAK_BASE_URL=http://localhost:8080
    KEYCLOAK_REALM=Hotel_Realm
    KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
    KEYCLOAK_ADMIN_CLIENT_SECRET=          # leave empty if using username/password grant
    KEYCLOAK_ADMIN_USERNAME=admin
    KEYCLOAK_ADMIN_PASSWORD=admin

The realm name and base URL must match exactly what is in the API Gateway's
application.properties:
    spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/Hotel_Realm
"""

import os
import httpx
from fastapi import HTTPException

# ── Keycloak coordinates (must match Gateway's issuer-uri) ──────────────────
KEYCLOAK_BASE_URL        = os.getenv("KEYCLOAK_BASE_URL",           "http://localhost:8080")
KEYCLOAK_REALM           = os.getenv("KEYCLOAK_REALM",              "Hotel_Realm")
KEYCLOAK_ADMIN_CLIENT_ID = os.getenv("KEYCLOAK_ADMIN_CLIENT_ID",    "admin-cli")
KEYCLOAK_ADMIN_SECRET    = os.getenv("KEYCLOAK_ADMIN_CLIENT_SECRET", "")   # empty → password grant
KEYCLOAK_ADMIN_USERNAME  = os.getenv("KEYCLOAK_ADMIN_USERNAME",     "admin")
KEYCLOAK_ADMIN_PASSWORD  = os.getenv("KEYCLOAK_ADMIN_PASSWORD",     "admin")

# Derived URLs
_TOKEN_URL   = f"{KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token"
_USERS_URL   = f"{KEYCLOAK_BASE_URL}/admin/realms/{KEYCLOAK_REALM}/users"
_ROLES_URL   = f"{KEYCLOAK_BASE_URL}/admin/realms/{KEYCLOAK_REALM}/roles"


def _get_admin_token() -> str:
    """Obtain a short-lived Admin REST API access token from the master realm."""
    payload = {
        "client_id":  KEYCLOAK_ADMIN_CLIENT_ID,
        "grant_type": "password",
        "username":   KEYCLOAK_ADMIN_USERNAME,
        "password":   KEYCLOAK_ADMIN_PASSWORD,
    }
    if KEYCLOAK_ADMIN_SECRET:
        payload["client_secret"] = KEYCLOAK_ADMIN_SECRET

    try:
        resp = httpx.post(_TOKEN_URL, data=payload, timeout=10)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Cannot connect to Keycloak token endpoint: {e}")
        
    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Could not authenticate with Keycloak Admin API: {resp.text}"
        )
    return resp.json()["access_token"]


def _assign_realm_role(keycloak_user_id: str, role_name: str, admin_token: str) -> None:
    """
    Fetch the Keycloak realm role representation and assign it to the user.
    Silently skips if the role does not exist in Keycloak.
    """
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type":  "application/json",
    }

    # 1. Fetch the role representation from the realm
    role_resp = httpx.get(f"{_ROLES_URL}/{role_name}", headers=headers, timeout=10)
    if role_resp.status_code == 404:
        # Role doesn't exist in Keycloak yet — skip silently
        return
    if role_resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Could not fetch Keycloak role '{role_name}': {role_resp.text}",
        )

    role_repr = role_resp.json()

    # 2. Assign the role to the user
    assign_url = f"{_USERS_URL}/{keycloak_user_id}/role-mappings/realm"
    assign_resp = httpx.post(assign_url, json=[role_repr], headers=headers, timeout=10)
    if assign_resp.status_code not in (200, 204):
        raise HTTPException(
            status_code=502,
            detail=f"Could not assign realm role '{role_name}' to user: {assign_resp.text}",
        )


def mirror_user_in_keycloak(
    email: str,
    plain_password: str,
    first_name: str,
    last_name: str,
    role: str = "CLIENT",
) -> str | None:
    """
    Create a user in Keycloak that mirrors the locally registered user,
    then assign the corresponding realm role so the JWT token contains
    the correct role in realm_access.roles and the email claim.

    Parameters
    ----------
    email          : user email (used as Keycloak username too)
    plain_password : the original plain-text password submitted during registration
    first_name     : user's first name
    last_name      : user's last name
    role           : string role — mapped to a Keycloak realm role (ADMIN, PERSONNEL, CLIENT)

    Returns
    -------
    The Keycloak user ID (UUID string) on success, or None if the user already
    exists (idempotent).

    Raises
    ------
    HTTPException(502) if Keycloak is unreachable or returns an unexpected error.
    """
    token = _get_admin_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
    }

    user_payload = {
        "username":      email,
        "email":         email,
        "firstName":     first_name,
        "lastName":      last_name,
        "enabled":       True,
        # emailVerified=True ensures Keycloak includes the 'email' claim in the JWT
        "emailVerified": True,
        "credentials": [
            {
                "type":      "password",
                "value":     plain_password,
                "temporary": False,
            }
        ],
    }

    resp = httpx.post(_USERS_URL, json=user_payload, headers=headers, timeout=10)

    if resp.status_code == 409:
        # User already exists in Keycloak — find their ID and (re)assign role
        search_resp = httpx.get(
            _USERS_URL,
            params={"email": email, "exact": "true"},
            headers=headers,
            timeout=10,
        )
        if search_resp.status_code == 200 and search_resp.json():
            existing_id = search_resp.json()[0]["id"]
            _assign_realm_role(existing_id, role, token)
        return None

    if resp.status_code != 201:
        raise HTTPException(
            status_code=502,
            detail=f"Keycloak user creation failed ({resp.status_code}): {resp.text}",
        )

    # Extract the new user's ID from the Location header
    location = resp.headers.get("Location", "")
    keycloak_user_id = location.rstrip("/").split("/")[-1] if location else None

    # Assign the realm role so the JWT includes it in realm_access.roles
    if keycloak_user_id:
        _assign_realm_role(keycloak_user_id, role, token)

    return keycloak_user_id
