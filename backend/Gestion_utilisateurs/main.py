from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from contextlib import asynccontextmanager
import asyncio
import httpx

import models, schemas, crud, auth
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

EUREKA_URL = "http://localhost:8761/eureka/apps/UTILISATEURS_SERVICE"
INSTANCE_ID = "utilisateurs_service:8000"

REGISTRATION = {
    "instance": {
        "instanceId": INSTANCE_ID,
        "hostName": "localhost",
        "app": "UTILISATEURS_SERVICE",
        "ipAddr": "127.0.0.1",
        "status": "UP",
        "port": {"$": 8000, "@enabled": "true"},
        "securePort": {"$": 443, "@enabled": "false"},
        "homePageUrl": "http://localhost:8000/",
        "statusPageUrl": "http://localhost:8000/info",
        "healthCheckUrl": "http://localhost:8000/health",
        "dataCenterInfo": {
            "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
            "name": "MyOwn"
        },
        "leaseInfo": {
            "renewalIntervalInSecs": 10,
            "durationInSecs": 30
        }
    }
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with httpx.AsyncClient() as client:
        # Step 1: delete THIS specific instance if it exists
        await client.delete(f"{EUREKA_URL}/{INSTANCE_ID}")
        await asyncio.sleep(2)  # wait for Eureka to process deletion
        # Step 2: register fresh
        r = await client.post(EUREKA_URL, json=REGISTRATION, headers={"Content-Type": "application/json"})
        print(f"Eureka registered: {r.status_code}")

    # Step 3: heartbeat every 10s to stay UP
    async def heartbeat():
        while True:
            await asyncio.sleep(10)
            async with httpx.AsyncClient() as c:
                await c.put(f"{EUREKA_URL}/{INSTANCE_ID}")

    task = asyncio.create_task(heartbeat())
    yield
    # Step 4: clean deregister on shutdown
    task.cancel()
    async with httpx.AsyncClient() as client:
        await client.delete(f"{EUREKA_URL}/{INSTANCE_ID}")
        print("Eureka deregistered")


app = FastAPI(title="User Microservice - Flat Arch.", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registration endpoint is defined below with Keycloak integration.


# =============================================
# Configuration Keycloak
# =============================================
KEYCLOAK_URL = "http://localhost:8080"
KEYCLOAK_REALM = "hotel-brise-douce"
KEYCLOAK_CLIENT_ID = "hotel-gateway"
KEYCLOAK_CLIENT_SECRET = "4kSmz4yrnhTqkaClDC4oybYjJiUjAm6O"

# Identifiants de votre compte admin Keycloak pour la gestion des utilisateurs
KEYCLOAK_ADMIN_USER = "admin"
KEYCLOAK_ADMIN_PWD = "admin"

@app.post("/register", response_model=schemas.UtilisateurResponse)
async def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    # 1. Vérification locale de l'email
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered in local database.")
        
    # 2. Tentative de création dans KEYCLOAK d'abord (pour éviter les utilisateurs en DB locale sans compte Keycloak)
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # A. Obtenir le token Admin Keycloak
            token_url = f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
            token_res = await client.post(token_url, data={
                "grant_type": "password",
                "client_id": "admin-cli",
                "username": KEYCLOAK_ADMIN_USER,
                "password": KEYCLOAK_ADMIN_PWD
            })
            if token_res.status_code != 200:
                print(f"[ERROR] Impossible d'obtenir le token admin Keycloak: {token_res.text}")
                raise HTTPException(status_code=500, detail="Erreur de configuration Keycloak (admin inaccessible).")
            
            admin_token = token_res.json().get("access_token")
            auth_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
            
            # B. Création de l'utilisateur
            users_url = f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM}/users"
            user_payload = {
                "username": user.email,
                "email": user.email,
                "firstName": user.prenom,
                "lastName": user.nom,
                "enabled": True,
                "emailVerified": True
            }
            res = await client.post(users_url, json=user_payload, headers=auth_headers)
            
            if res.status_code == 409:
                # L'utilisateur existe déjà dans Keycloak, on continue quand même (on va juste forcer le mot de passe après)
                print(f"[INFO] Utilisateur {user.email} déjà présent dans Keycloak.")
            elif res.status_code not in [201, 200]:
                print(f"[ERROR] Échec création utilisateur Keycloak: {res.text}")
                raise HTTPException(status_code=400, detail=f"Erreur Keycloak: {res.text}")

            # C. Récupération de l'ID utilisateur Keycloak pour lui affecter le mot de passe
            # (Le 201 Created contient l'URL dans le header 'Location')
            search_url = f"{users_url}?email={user.email}&exact=true"
            search_res = await client.get(search_url, headers=auth_headers)
            kc_users = search_res.json()
            if not kc_users:
                raise HTTPException(status_code=500, detail="Utilisateur créé mais introuvable dans Keycloak.")
            
            kc_user_id = kc_users[0]["id"]
            
            # D. Affectation EXPLICITE du mot de passe (Force non-temporaire)
            reset_pwd_url = f"{users_url}/{kc_user_id}/reset-password"
            pwd_payload = {
                "type": "password",
                "value": user.motDePasse,
                "temporary": False
            }
            pwd_res = await client.put(reset_pwd_url, json=pwd_payload, headers=auth_headers)
            if pwd_res.status_code not in [204, 201, 200]:
                print(f"[ERROR] Échec affectation mot de passe Keycloak: {pwd_res.text}")
                raise HTTPException(status_code=500, detail="Le compte a été créé mais le mot de passe n'a pas pu être configuré.")

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] Exception lors de la synchronisation Keycloak: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de synchronisation avec Keycloak: {str(e)}")

    # 3. Création finale dans la base de données locale SEULEMENT si Keycloak est OK
    created_user = crud.register_user(db=db, user_data=user)
    return created_user


@app.post("/login", response_model=schemas.Token)
async def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Etape 1 : Vérifier l'utilisateur dans la base de données locale pour s'assurer qu'il existe et a un rôle
    user = crud.get_user_by_email(db, email=login_data.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Utilisateur inexistant localement.")
    
    # Etape 2 : Vérifier si le compte est inactif (Personnel uniquement)
    if user.role == models.RoleEnum.PERSONNEL and user.status == "Inactif":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Votre compte est inactif. Veuillez contacter l'administration."
        )

    # Etape 3 : Appeler Keycloak pour obtenir un token JWT valide
    keycloak_token_url = f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
    
    # Keycloak accepte l'email directement si "Login with email" est activé dans le realm
    payload = {
        "grant_type": "password",
        "client_id": KEYCLOAK_CLIENT_ID,
        "client_secret": KEYCLOAK_CLIENT_SECRET,
        "username": login_data.username,  # email envoyé par le frontend
        "password": login_data.password,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            keycloak_response = await client.post(
                keycloak_token_url,
                data=payload,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
        
        if keycloak_response.status_code != 200:
            print(f"[WARN] Keycloak auth failed ({keycloak_response.status_code}): {keycloak_response.text}")
            # Si Keycloak renvoie une erreur spécifique, on peut l'analyser
            error_detail = "Échec de l'authentification Keycloak. Vérifiez vos identifiants."
            if keycloak_response.status_code == 401:
                error_detail = "Identifiants incorrects ou compte non synchronisé avec Keycloak."
            
            raise HTTPException(
                status_code=keycloak_response.status_code if keycloak_response.status_code in [401, 403] else 401, 
                detail=error_detail
            )
        
        # Etape 4 : Retourner le token Keycloak au frontend
        token_data = keycloak_response.json()
        
        if "access_token" not in token_data:
            print(f"[ERROR] access_token missing in Keycloak response: {token_data}")
            raise HTTPException(status_code=500, detail="Réponse Keycloak invalide (token manquant).")

        return {
            "access_token": token_data["access_token"],
            "token_type": "bearer"
        }

    except httpx.RequestError as exc:
        print(f"[ERROR] Could not connect to Keycloak at {exc.request.url}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le service d'authentification (Keycloak) est temporairement indisponible. Veuillez réessayer plus tard."
        )
    except Exception as e:
        print(f"[ERROR] Unexpected error during login: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne lors de la connexion: {str(e)}")


@app.get("/users/me", response_model=schemas.UtilisateurResponse)
def get_my_profile(
    current_user: models.Utilisateur = Depends(auth.get_current_active_user)
):
    return current_user

@app.put("/users/me/profile", response_model=schemas.UtilisateurResponse)
def update_my_profile(
    profile_data: schemas.UserProfileUpdate,
    current_user: models.Utilisateur = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.update_user_profile(db, current_user.idUtilisateur, profile_data)

@app.post("/setup-initial-admin")
def setup_admin(db: Session = Depends(get_db)):
    if db.query(models.Utilisateur).first():
        return {"message": "Users already exist. Setup blocked."}
    hashed_password = auth.get_password_hash("admin123")
    admin = models.Utilisateur(
        nom="Root", prenom="Admin", email="admin@hotel.com",
        motDePasse=hashed_password, telephone="0000",
        role=models.RoleEnum.ADMIN
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin created. email: admin@hotel.com | pwd: admin123"}

allow_admin = auth.RoleChecker([models.RoleEnum.ADMIN])

@app.get("/users", response_model=List[schemas.UtilisateurResponse])
def get_all_users(current_user: models.Utilisateur = Depends(allow_admin), db: Session = Depends(get_db)):
    return crud.get_users(db)

@app.put("/users/{user_id}/role", response_model=schemas.UtilisateurResponse)
def change_user_role(user_id: int, role_data: schemas.RoleUpdate, current_user: models.Utilisateur = Depends(allow_admin), db: Session = Depends(get_db)):
    updated = crud.update_user_role_admin(db, user_id, role_data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@app.put("/users/{user_id}/profile", response_model=schemas.UtilisateurResponse)
def admin_update_user_profile(user_id: int, profile_data: schemas.UserProfileUpdate, current_user: models.Utilisateur = Depends(allow_admin), db: Session = Depends(get_db)):
    updated = crud.update_user_profile(db, user_id, profile_data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@app.delete("/users/{user_id}")
def delete_user_account(user_id: int, current_user: models.Utilisateur = Depends(allow_admin), db: Session = Depends(get_db)):
    user = crud.delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.get("/notifications/me", response_model=List[schemas.NotificationResponse])
def get_my_notifications(
    current_user: models.Utilisateur = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_notifications(db, current_user.idUtilisateur)

@app.put("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: models.Utilisateur = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    notif = crud.mark_notification_as_read(db, notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}