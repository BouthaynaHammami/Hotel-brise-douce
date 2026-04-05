import asyncio
import httpx
import sys

KEYCLOAK_URL = "http://localhost:8080"
KEYCLOAK_REALM = "hotel-brise-douce"

async def test_kc():
    async with httpx.AsyncClient() as client:
        keycloak_token_url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
        payload = {
            "grant_type": "password",
            "client_id": "hotel-gateway",
            "client_secret": "4kSmz4yrnhTqkaClDC4oybYjJiUjAm6O",
            "username": "bouthayna@esprit.tn",
            "password": "Bouthayna"
        }
        r = await client.post(keycloak_token_url, data=payload)
        token = r.json().get("access_token")
        
        # Now test going to users/me through Gateway!
        gateway_url = "http://localhost:8081/utilisateurs/api/users/me"
        print("Testing gateway...")
        gw_r = await client.get(gateway_url, headers={"Authorization": f"Bearer {token}"})
        print(f"Gateway returned: {gw_r.status_code}")
        print(gw_r.text)
        
        # Test hitting python backend directly!
        direct_url = "http://localhost:8000/users/me"
        print("Testing direct...")
        direct_r = await client.get(direct_url, headers={"Authorization": f"Bearer {token}"})
        print(f"Direct returned: {direct_r.status_code}")
        print(direct_r.text)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_kc())
