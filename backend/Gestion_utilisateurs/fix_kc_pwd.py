import asyncio
import httpx
import sys

KEYCLOAK_URL = "http://localhost:8080"
KEYCLOAK_REALM = "hotel-brise-douce"

async def get_admin_token(client):
    url = f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
    payload = {"grant_type": "password", "client_id": "admin-cli", "username": "admin", "password": "admin"}
    r = await client.post(url, data=payload)
    return r.json().get("access_token")

async def sync():
    async with httpx.AsyncClient() as client:
        token = await get_admin_token(client)
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        users_endpoint = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users"
        search_res = await client.get(f"{users_endpoint}?email=bouthayna@esprit.tn", headers=headers)
        kc_users = search_res.json()
        if kc_users:
            b_id = kc_users[0]['id']
            pwd_url = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users/{b_id}/reset-password"
            # Setting it to Bouthayna
            pwd_res = await client.put(pwd_url, json={"type": "password", "value": "Bouthayna", "temporary": False}, headers=headers)
            print(f"Bouthayna password reset: {pwd_res.status_code}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(sync())
