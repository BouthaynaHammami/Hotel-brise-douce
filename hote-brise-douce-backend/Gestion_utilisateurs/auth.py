import bcrypt
import json
import base64
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

import crud
import models
from database import get_db

# ============================================================
# Password hashing — used for local DB storage only.
# Token generation/validation is fully delegated to Keycloak
# and verified by the API Gateway (Spring Security OAuth2).
# ============================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# On extrait le token du header 'Authorization'
def _email_from_bearer(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Header Authorization manquant ou invalide")

    token = authorization.split(" ", 1)[1]
    try:
        payload_b64 = token.split(".")[1]
        # Ajouter le padding pour base64
        payload_b64 += "=" * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.b64decode(payload_b64))
    except Exception:
        raise HTTPException(status_code=401, detail="Impossible de lire le token")

    # Le token Keycloak utilise "email" ou "preferred_username"
    # Le token Custom Python utilise "sub"
    email = payload.get("email") or payload.get("preferred_username") or payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Aucun email trouvé dans le token")
    return email

def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
) -> models.Utilisateur:
    email = _email_from_bearer(authorization)
    user = crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable dans la base locale",
        )
    return user

def get_current_active_user(current_user: models.Utilisateur = Depends(get_current_user)) -> models.Utilisateur:
    # Optionnel : de-commentez la verification statusCompte si besoin
    # if not current_user.statusCompte:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")
    return current_user

def allow_admin(current_user: models.Utilisateur = Depends(get_current_active_user)) -> models.Utilisateur:
    if current_user.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requires admin privileges")
    return current_user