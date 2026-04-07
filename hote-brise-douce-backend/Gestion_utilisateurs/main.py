import base64
import json
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import py_eureka_client.eureka_client as eureka_client

import models, schemas, crud, auth
from database import engine, get_db
from keycloak_client import mirror_user_in_keycloak

# ── DB bootstrap ─────────────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

# ── Eureka config ─────────────────────────────────────────────────────────────
EUREKA_SERVER = "http://localhost:8761/eureka/"
APP_NAME      = "UTILISATEURS-SERVICE"
INSTANCE_PORT = 8000


# ── App lifespan (startup / shutdown) ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name=APP_NAME,
        instance_port=INSTANCE_PORT,
        instance_host="localhost",
    )
    yield
    await eureka_client.stop_async()


app = FastAPI(title="User Microservice – Hybrid Keycloak Mode", lifespan=lifespan)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── JWT helper ────────────────────────────────────────────────────────────────
def _email_from_bearer(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        payload_b64 = token.split(".")[1]
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.b64decode(payload_b64))
    except Exception:
        raise HTTPException(status_code=401, detail="Could not decode token payload")

    email = payload.get("email") or payload.get("preferred_username")
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Token does not contain 'email' or 'preferred_username' claim. "
                   "Enable the email claim in your Keycloak client mapper."
        )
    return email


# ── Health / Info ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Infra"])
def health():
    return {"status": "UP"}

@app.get("/info", tags=["Infra"])
def info():
    return {"app": APP_NAME}


# ── Registration ──────────────────────────────────────────────────────────────
@app.post("/register", response_model=schemas.UtilisateurResponse, tags=["Auth"])
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = crud.register_user(db, user)

    try:
        mirror_user_in_keycloak(
            email=user.email,
            plain_password=user.motDePasse,
            first_name=user.prenom,
            last_name=user.nom,
            role=db_user.role.value,
        )
    except HTTPException as exc:
        db.delete(db_user)
        db.commit()
        raise exc

    return db_user


# ── Admin setup (bootstrap only) ──────────────────────────────────────────────
@app.post("/setup-initial-admin", tags=["Admin"])
def setup_admin(db: Session = Depends(get_db)):
    if db.query(models.Utilisateur).first():
        return {"message": "Already initialized"}

    admin = models.Utilisateur(
        nom="Root",
        prenom="Admin",
        email="admin@hotel.com",
        motDePasse=auth.get_password_hash("admin123"),
        telephone="0000",
        role=models.RoleEnum.ADMIN,
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin created (admin@hotel.com / admin123)"}


# ── Internal (service-to-service) ─────────────────────────────────────────────
@app.get("/users/internal", response_model=List[schemas.UtilisateurResponse], tags=["Internal"])
def get_users_internal(db: Session = Depends(get_db)):
    return crud.get_users(db)


# ── Self-profile endpoints (static — must come before /{user_id} routes) ──────

@app.get("/users/me", response_model=schemas.UtilisateurResponse, tags=["Users"])
def get_me(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    email = _email_from_bearer(authorization)
    user = crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"No local user record found for '{email}'."
        )
    return user


@app.put("/users/me/profile", response_model=schemas.UtilisateurResponse, tags=["Users"])
def update_profile(
    data: schemas.UserProfileUpdate,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    email = _email_from_bearer(authorization)
    user = crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"No local user record found for '{email}'."
        )

    update_data = data.model_dump(exclude_unset=True) if hasattr(data, 'model_dump') else data.dict(exclude_unset=True)
    if not update_data:
        return user

    return crud.update_user_profile(db, user.idUtilisateur, data)


# ── Admin routes (dynamic — must come after static /me routes) ────────────────

@app.get("/users", response_model=List[schemas.UtilisateurResponse], tags=["Admin"])
def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db)


@app.put("/users/{user_id}/role", response_model=schemas.UtilisateurResponse, tags=["Admin"])
def update_role(user_id: int, role: schemas.RoleUpdate, db: Session = Depends(get_db)):
    user = crud.update_user_role_admin(db, user_id, role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.delete("/users/{user_id}", tags=["Admin"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}