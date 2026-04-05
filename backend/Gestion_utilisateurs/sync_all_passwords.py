import asyncio
import httpx
import sys
from database import SessionLocal
import models
import auth

KEYCLOAK_URL = "http://localhost:8080"
KEYCLOAK_REALM = "hotel-brise-douce"

async def get_admin_token(client):
    url = f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
    payload = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": "admin",
        "password": "admin"
    }
    r = await client.post(url, data=payload)
    return r.json().get("access_token")

async def sync():
    db = SessionLocal()
    users = db.query(models.Utilisateur).all()
    
    if not users:
        print("Aucun utilisateur dans la BDD !")
        return
        
    async with httpx.AsyncClient() as client:
        token = await get_admin_token(client)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        users_endpoint = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users"
        
        print("--- DÉBUT DE LA SYNCHRONISATION FORCÉE DES MOTS DE PASSE ---")
        for u in users:
            email = u.email
            if not email: continue
            
            # Déduire le mot de passe du nom d'utilisateur (Ex: bouthayna@esprit.tn -> Bouthayna)
            base_name = email.split('@')[0]
            new_password = base_name.capitalize()
            
            print(f"Utilisateur: {email} | Nouveau Mot de passe défini sur: {new_password}")
            
            # 1. Update LOCAL DB
            u.motDePasse = auth.get_password_hash(new_password)
            
            # 2. Update KEYCLOAK
            search_res = await client.get(f"{users_endpoint}?email={email}&exact=true", headers=headers)
            kc_users = search_res.json()
            if kc_users:
                # L'utilisateur existe, on force le reset du mot de passe
                user_id = kc_users[0]['id']
                pwd_url = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users/{user_id}/reset-password"
                pwd_res = await client.put(pwd_url, json={
                    "type": "password",
                    "value": new_password,
                    "temporary": False
                }, headers=headers)
                print(f"   -> Keycloak mis à jour ({pwd_res.status_code})")
            else:
                # Utilisateur n'existe pas dans KC, on le crée
                user_payload = {
                    "username": email,
                    "email": email,
                    "firstName": u.prenom if u.prenom else "",
                    "lastName": u.nom if u.nom else "",
                    "enabled": True,
                    "emailVerified": True,
                    "credentials": [{
                        "type": "password",
                        "value": new_password,
                        "temporary": False
                    }]
                }
                create_res = await client.post(users_endpoint, json=user_payload, headers=headers)
                print(f"   -> Créé dans Keycloak ({create_res.status_code})")
                
        db.commit()
    db.close()
    print("--- FIN DE LA SYNCHRONISATION ---")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(sync())
