import httpx
import asyncio
from jose import jwt
import sys

KEYCLOAK_URL = "http://localhost:8080"
KEYCLOAK_REALM = "hotel-brise-douce"

async def test_jwt():
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
        
        try:
            payload = jwt.get_unverified_claims(token)
            print("DECODE WITH GET_UNVERIFIED_CLAIMS SUCCESS:")
            print(payload)
        except Exception as e:
            print(f"DECODE FAILED: {e}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_jwt())
