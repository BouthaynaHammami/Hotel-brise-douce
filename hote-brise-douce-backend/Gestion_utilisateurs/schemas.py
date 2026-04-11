from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional
from models import RoleEnum, TypeClientEnum


class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    telephone: str


# ── Registration input ────────────────────────────────────────────────────────
class UserRegister(UtilisateurBase):
    motDePasse: str


# ── User self-update ──────────────────────────────────────────────────────────
class UserProfileUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    allergies: Optional[str] = None
    typeClient: Optional[TypeClientEnum] = None


# ── Admin-only role update ────────────────────────────────────────────────────
class RoleUpdate(BaseModel):
    role: RoleEnum
    matricule: Optional[str] = None
    poste: Optional[str] = None
    status: Optional[str] = None
    horaires: Optional[str] = None


# ── Response (password always excluded) ──────────────────────────────────────
class UtilisateurResponse(UtilisateurBase):
    idUtilisateur: int
    role: RoleEnum
    statusCompte: bool
    dateCreation: datetime

    typeClient: Optional[TypeClientEnum] = None
    allergies: Optional[str] = None
    dernierSejour: Optional[date] = None
    actif: Optional[bool] = None

    matricule: Optional[str] = None
    poste: Optional[str] = None
    dateEmbauche: Optional[date] = None
    status: Optional[str] = None
    horaires: Optional[str] = None

    class Config:
        from_attributes = True

# NOTE: The Token schema has been removed.
# Token issuance is now handled entirely by Keycloak.
# Clients should POST to:
#   http://localhost:8080/realms/Hotel_Realm/protocol/openid-connect/token
# with grant_type=password, client_id, username, and password.

class NotificationBase(BaseModel):
    idUtilisateur: int
    titre: str
    message: str

class NotificationResponse(NotificationBase):
    id: int
    dateCreation: datetime
    lue: bool

    class Config:
        from_attributes = True