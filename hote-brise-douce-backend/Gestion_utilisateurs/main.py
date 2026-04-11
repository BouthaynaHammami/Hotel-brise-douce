import base64
import json
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import py_eureka_client.eureka_client as eureka_client

import threading
import traceback
import models, schemas, crud, auth
from sqlalchemy import text
from database import engine, get_db
from keycloak_client import mirror_user_in_keycloak
from notification_consumer import start_consumer

# ── DB bootstrap ─────────────────────────────────────────────────────────────
print(" [INIT] Attempting to initialize database...")
try:
    models.Base.metadata.create_all(bind=engine)
    print(" [SUCCESS] Database tables created/verified successfully")
except Exception as e:
    print(f" [ERROR] Failed to connect to database: {e}")
    print(" [ERROR] Please ensure:")
    print("   1. MySQL server is running (typically on localhost:3306)")
    print("   2. User 'root' exists (as configured in your .env)")
    print("   3. Database 'hotel_db_utilisateur' exists or can be created")
    print("   4. Check your .env file configuration")
    print(" [WARNING] Continuing startup despite database connection error...")

# ── Eureka config ─────────────────────────────────────────────────────────────
EUREKA_SERVER = "http://localhost:8761/eureka/"
APP_NAME = "UTILISATEURS-SERVICE"
INSTANCE_PORT = 8000

# ── App lifespan (startup / shutdown) ────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(" [INIT] Lancement du thread consommateur de notifications...")
    consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    consumer_thread.start()

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
        print(f" [DEBUG] Missing/invalid Authorization header: {authorization}")
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")

    token = authorization.split(" ", 1)[1]
    try:
        payload_b64 = token.split(".")[1]
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.b64decode(payload_b64))
        print(f" [DEBUG] Token claims: {list(payload.keys())}")
    except Exception as decode_err:
        print(f" [DEBUG] Token decode error: {decode_err}")
        raise HTTPException(status_code=401, detail=f"Could not decode token payload: {str(decode_err)}")

    email = payload.get("email") or payload.get("preferred_username")
    if not email:
        print(f" [DEBUG] Token payload keys: {list(payload.keys())}")
        print(f" [DEBUG] Full token payload: {payload}")
        raise HTTPException(
            status_code=401,
            detail=f"Token missing email claim. Available claims: {list(payload.keys())}. "
                   "Configure Keycloak Client Mappers to include 'email' claim."
        )
    print(f" [DEBUG] Extracted email: {email}")
    return email

# ── Health / Info ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Infra"])
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "UP", "database": "CONNECTED"}
    except Exception as e:
        return {"status": "DEGRADED", "database": f"ERROR: {str(e)}"}

@app.get("/debug/headers", tags=["Debug"])
def debug_headers(request: Request):
    """Debug endpoint to see what headers are being received"""
    headers_dict = dict(request.headers)
    print(f" [DEBUG] Received headers: {headers_dict}")
    return {
        "headers": headers_dict,
        "has_authorization": "authorization" in headers_dict,
        "authorization_header": headers_dict.get("authorization", "MISSING")
    }

@app.get("/debug/users-in-db", tags=["Debug"])
def debug_users_in_db(db: Session = Depends(get_db)):
    """Check how many users exist in the database"""
    all_users = crud.get_users(db)
    return {
        "total_users": len(all_users),
        "users": [{"id": u.idUtilisateur, "email": u.email, "nom": u.nom} for u in all_users]
    }

@app.get("/info", tags=["Infra"])
def info():
    return {"app": APP_NAME}

# ── Registration ──────────────────────────────────────────────────────────────
@app.post("/register", response_model=schemas.UtilisateurResponse, tags=["Auth"])
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    try:
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
        except Exception as k_exc:
            print(f" [WARNING] Keycloak mirror failed: {k_exc}")

        return db_user
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        
        error_details = traceback.format_exc()
        print(f" [ERROR] Registration logic failed:\n{error_details}")
        
        # Log specifically for DB connection issues
        if "pymysql.err.OperationalError" in error_details:
             print(" [CRITICAL] Database connection error! Is MySQL running?")

        # We return a 500 but with the actual error message in the detail
        raise HTTPException(
            status_code=500, 
            detail=f"Registration failed: {str(exc)}"
        )

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

# ── Self-profile endpoints (static — before /{user_id}) ──────────────────────
@app.get("/users/me", response_model=schemas.UtilisateurResponse, tags=["Users"])
def get_me(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
):
    try:
        email = _email_from_bearer(authorization)
        user = crud.get_user_by_email(db, email)
        if not user:
            print(f" [WARNING] No local user record for email: {email}")
            raise HTTPException(
                status_code=404,
                detail=f"No local user record found for '{email}'. Please register first at /register."
            )
        print(f" [DEBUG] Successfully loaded user: {email}")
        return user
    except HTTPException:
        raise
    except Exception as exc:
        print(f" [ERROR] /users/me failed: {exc}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(exc)}")

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

# ── Admin / dynamic routes ────────────────────────────────────────────────────
@app.get("/users", response_model=List[schemas.UtilisateurResponse], tags=["Admin"])
def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

# ✅ ROUTE MANQUANTE AJOUTÉE
@app.get("/users/{user_id}", response_model=schemas.UtilisateurResponse, tags=["Users"])
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}/role", response_model=schemas.UtilisateurResponse, tags=["Admin"])
def update_role(user_id: int, role: schemas.RoleUpdate, db: Session = Depends(get_db)):
    user = crud.update_user_role_admin(db, user_id, role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}/profile", response_model=schemas.UtilisateurResponse)
def admin_update_user_profile(
    user_id: int,
    profile_data: schemas.UserProfileUpdate,
    current_user: models.Utilisateur = Depends(auth.allow_admin),
    db: Session = Depends(get_db)
):
    updated = crud.update_user_profile(db, user_id, profile_data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@app.delete("/users/{user_id}", tags=["Admin"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

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