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

@app.post("/register", response_model=schemas.UtilisateurResponse)
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.register_user(db=db, user_data=user)

@app.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=login_data.username)
    if not user or not auth.verify_password(login_data.password, user.motDePasse):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

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

@app.delete("/users/{user_id}")
def delete_user_account(user_id: int, current_user: models.Utilisateur = Depends(allow_admin), db: Session = Depends(get_db)):
    user = crud.delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}