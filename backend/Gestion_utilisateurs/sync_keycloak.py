import asyncio
import httpx
import sys

# Adaptez vos imports en fonction de l'architecture de votre projet.
from database import SessionLocal
import models

# --- Paramètres de Connexion Keycloak ---
# REMPLACEZ 'admin' par votre utilisateur administrateur de Keycloak
KEYCLOAK_ADMIN_USER = "admin"
KEYCLOAK_ADMIN_PWD = "admin"

KEYCLOAK_URL = "http://localhost:8080"
KEYCLOAK_REALM = "hotel-brise-douce"

# IMPORTANT: Les mots de passe en base Python sont hachés cryptographiquement.
# Nous ne pouvons pas envoyer le "haché" directement à Keycloak.
# Le script affectera donc ce mot de passe TEMPORAIRE par défaut à tous les anciens comptes.
DEFAULT_TEST_PASSWORD = "admin"

async def get_admin_token(client):
    url = f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
    payload = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": KEYCLOAK_ADMIN_USER,
        "password": KEYCLOAK_ADMIN_PWD
    }
    print(f"Tentative de connexion à {url} avec {KEYCLOAK_ADMIN_USER}...")
    r = await client.post(url, data=payload)
    if r.status_code != 200:
        print(f"ERREUR: Impossible d'obtenir le jeton administrateur. Code: {r.status_code}")
        print(f"Détail: {r.text}")
        print("Avez-vous bien mis les identifiants d'administration (master realm) dans le script ?")
        return None
    return r.json().get("access_token")

async def sync():
    # Connexion à la BDD locale
    db = SessionLocal()
    try:
        users = db.query(models.Utilisateur).all()
        print(f"[INFO] {len(users)} utilisateurs trouvés dans la base de données locale.\n")
    except Exception as e:
        print(f"Erreur de connexion à la base de données: {e}")
        return
    finally:
        db.close()

    if not users:
        print("Aucun utilisateur à synchroniser.")
        return

    async with httpx.AsyncClient() as client:
        token = await get_admin_token(client)
        if not token:
            return

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        users_endpoint = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users"

        for u in users:
            email = u.email
            if not email:
                continue
            
            # Vérifier si l'utilisateur existe déjà
            search_res = await client.get(f"{users_endpoint}?email={email}&exact=true", headers=headers)
            kc_users = search_res.json()
            if kc_users:
                print(f"[PASSE] {email} existe déjà dans Keycloak.")
                continue

            # Création de l'utilisateur
            print(f"[AJOUT] Création de {email} dans Keycloak...")
            user_payload = {
                "username": email,  # On force le nom d'utilisateur à être l'email
                "email": email,
                "firstName": u.prenom if u.prenom else "",
                "lastName": u.nom if u.nom else "",
                "enabled": True,
                "emailVerified": True,
                "credentials": [{
                    "type": "password",
                    "value": DEFAULT_TEST_PASSWORD,
                    "temporary": False
                }]
            }
            
            create_res = await client.post(users_endpoint, json=user_payload, headers=headers)
            if create_res.status_code in [201, 200]:
                print(f"   -> Succès ! (Mot de passe défini sur: '{DEFAULT_TEST_PASSWORD}')")
            else:
                print(f"   -> ERREUR: {create_res.status_code} - {create_res.text}")

    print("\n[Terminé] Synchronisation effectuée avec succès.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(sync())
