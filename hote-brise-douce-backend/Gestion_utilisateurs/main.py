from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

import py_eureka_client.eureka_client as eureka_client

import models, schemas, crud, auth
from database import engine, get_db

# ======================
# DB INIT
# ======================
models.Base.metadata.create_all(bind=engine)

# ======================
# EUREKA CONFIG
# ======================
EUREKA_SERVER = "http://localhost:8761/eureka/"
APP_NAME = "UTILISATEURS-SERVICE"
INSTANCE_PORT = 8000

# ======================
# FASTAPI INIT
# ======================
app = FastAPI(title="User Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# EUREKA REGISTER
# ======================
@app.on_event("startup")
async def startup():
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name=APP_NAME,
        instance_port=INSTANCE_PORT,
        instance_host="localhost"
    )

@app.on_event("shutdown")
async def shutdown():
    await eureka_client.stop_async()

# ======================
# HEALTH
# ======================
@app.get("/health")
def health():
    return {"status": "UP"}

@app.get("/info")
def info():
    return {"app": APP_NAME}

# ======================
# AUTH - FIXED LOGIN
# ======================
@app.post("/login", response_model=schemas.Token)
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, username)

    if not user or not auth.verify_password(password, user.motDePasse):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "idUtilisateur": user.idUtilisateur, "id": user.idUtilisateur},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# ======================
# REGISTER
# ======================
@app.post("/register", response_model=schemas.UtilisateurResponse)
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.register_user(db, user)

# ======================
# PROFILE
# ======================
@app.put("/users/me/profile", response_model=schemas.UtilisateurResponse)
def update_profile(
    data: schemas.UserProfileUpdate,
    current_user: models.Utilisateur = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.update_user_profile(db, current_user.idUtilisateur, data)

# ======================
# ADMIN SETUP
# ======================
@app.post("/setup-initial-admin")
def setup_admin(db: Session = Depends(get_db)):
    if db.query(models.Utilisateur).first():
        return {"message": "Already initialized"}

    admin = models.Utilisateur(
        nom="Root",
        prenom="Admin",
        email="admin@hotel.com",
        motDePasse=auth.get_password_hash("admin123"),
        telephone="0000",
        role=models.RoleEnum.ADMIN
    )

    db.add(admin)
    db.commit()

    return {"message": "Admin created (admin@hotel.com / admin123)"}

# ======================
# INTERNAL (service-to-service, no auth)
# ======================
@app.get("/users/internal", response_model=List[schemas.UtilisateurResponse])
def get_users_internal(db: Session = Depends(get_db)):
    """Public endpoint for internal microservice calls (no JWT required)."""
    return crud.get_users(db)

# ======================
# ADMIN ROUTES
# ======================
allow_admin = auth.RoleChecker([models.RoleEnum.ADMIN])

@app.get("/users", response_model=List[schemas.UtilisateurResponse])
def get_users(
    current_user: models.Utilisateur = Depends(allow_admin),
    db: Session = Depends(get_db)
):
    return crud.get_users(db)

@app.put("/users/{user_id}/role", response_model=schemas.UtilisateurResponse)
def update_role(
    user_id: int,
    role: schemas.RoleUpdate,
    current_user: models.Utilisateur = Depends(allow_admin),
    db: Session = Depends(get_db)
):
    user = crud.update_user_role_admin(db, user_id, role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.Utilisateur = Depends(allow_admin),
    db: Session = Depends(get_db)
):
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}