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
_TOKEN_URL = f"{KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token"
_USERS_URL = f"{KEYCLOAK_BASE_URL}/admin/realms/{KEYCLOAK_REALM}/users"
_ROLES_URL = f"{KEYCLOAK_BASE_URL}/admin/realms/{KEYCLOAK_REALM}/roles"


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

    resp = httpx.post(_TOKEN_URL, data=payload, timeout=10)
    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Could not authenticate with Keycloak Admin API: {resp.text}"
        )
    return resp.json()["access_token"]


def _get_realm_role(token: str, role_name: str) -> dict | None:
    """
    Fetch a realm role object by name.  Returns None if the role does not exist
    in Keycloak (the caller decides how to handle that case).
    """
    headers = {"Authorization": f"Bearer {token}"}
    resp = httpx.get(f"{_ROLES_URL}/{role_name}", headers=headers, timeout=10)
    if resp.status_code == 404:
        return None
    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Could not retrieve role '{role_name}' from Keycloak: {resp.text}",
        )
    return resp.json()


def _assign_realm_role(token: str, keycloak_user_id: str, role_name: str) -> None:
    """
    Assign a realm-level role to a Keycloak user.

    If the role does not exist in Keycloak the assignment is silently skipped
    (the role must be created in the Keycloak admin console first).
    """
    role = _get_realm_role(token, role_name)
    if role is None:
        # Role not yet defined in Keycloak — skip assignment silently.
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
    }
    role_mappings_url = f"{_USERS_URL}/{keycloak_user_id}/role-mappings/realm"
    resp = httpx.post(role_mappings_url, json=[role], headers=headers, timeout=10)
    if resp.status_code not in (200, 204):
        raise HTTPException(
            status_code=502,
            detail=f"Could not assign role '{role_name}' to Keycloak user: {resp.text}",
        )


def _get_keycloak_user_id_by_email(token: str, email: str) -> str | None:
    """Look up a Keycloak user by email and return their Keycloak UUID."""
    headers = {"Authorization": f"Bearer {token}"}
    resp = httpx.get(
        _USERS_URL,
        params={"email": email, "exact": "true"},
        headers=headers,
        timeout=10,
    )
    if resp.status_code != 200:
        return None
    users = resp.json()
    return users[0]["id"] if users else None


def _remove_realm_roles(token: str, keycloak_user_id: str, role_names: list[str]) -> None:
    """
    Remove a list of realm roles from a Keycloak user (best-effort).
    Missing roles are silently ignored.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
    }
    roles_to_remove = []
    for name in role_names:
        role = _get_realm_role(token, name)
        if role:
            roles_to_remove.append(role)

    if not roles_to_remove:
        return

    role_mappings_url = f"{_USERS_URL}/{keycloak_user_id}/role-mappings/realm"
    httpx.request(
        "DELETE",
        role_mappings_url,
        json=roles_to_remove,
        headers=headers,
        timeout=10,
    )


def mirror_user_in_keycloak(
    email: str,
    plain_password: str,
    first_name: str,
    last_name: str,
    role: str = "CLIENT",
) -> str | None:
    """
    Create a user in Keycloak that mirrors the locally registered user and
    assign the matching realm role so that the JWT returned by Keycloak on
    login contains the correct role inside ``realm_access.roles``.

    Parameters
    ----------
    email          : user email (used as Keycloak username too)
    plain_password : the original plain-text password submitted during registration
    first_name     : user's first name
    last_name      : user's last name
    role           : string role — mapped to a Keycloak realm role if it exists

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
        "username":  email,
        "email":     email,
        "firstName": first_name,
        "lastName":  last_name,
        "enabled":   True,
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
        # User already exists in Keycloak — treat as idempotent success.
        # Ensure the role is still assigned in case it was missed before.
        existing_id = _get_keycloak_user_id_by_email(token, email)
        if existing_id and role:
            _assign_realm_role(token, existing_id, role)
        return existing_id

    if resp.status_code != 201:
        raise HTTPException(
            status_code=502,
            detail=f"Keycloak user creation failed ({resp.status_code}): {resp.text}",
        )

    # Extract the new user's ID from the Location header
    location = resp.headers.get("Location", "")
    keycloak_user_id = location.rstrip("/").split("/")[-1] if location else None

    # Assign the application realm role so it appears in realm_access.roles
    if keycloak_user_id and role:
        _assign_realm_role(token, keycloak_user_id, role)

    return keycloak_user_id


def update_user_role_in_keycloak(email: str, old_role: str, new_role: str) -> None:
    """
    Replace a user's application realm role in Keycloak.

    This keeps the Keycloak JWT in sync when an admin changes a user's role
    via the local DB so that ``realm_access.roles`` in the next token reflects
    the updated role.

    Parameters
    ----------
    email    : the user's email (used to look up their Keycloak account)
    old_role : role name to remove (e.g. ``"CLIENT"``)
    new_role : role name to add   (e.g. ``"PERSONNEL"``)
    """
    token = _get_admin_token()
    keycloak_user_id = _get_keycloak_user_id_by_email(token, email)
    if not keycloak_user_id:
        # User not found in Keycloak — nothing to update.
        return

    app_roles = ["ADMIN", "CLIENT", "PERSONNEL"]
    roles_to_remove = [r for r in app_roles if r != new_role]
    _remove_realm_roles(token, keycloak_user_id, roles_to_remove)
    _assign_realm_role(token, keycloak_user_id, new_role)
