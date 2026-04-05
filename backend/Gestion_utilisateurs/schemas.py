from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional
from models import RoleEnum, TypeClientEnum

class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    telephone: str

# 1. Registration input
class UserRegister(UtilisateurBase):
    motDePasse: str

# 2. JSON login body (replaces OAuth2PasswordRequestForm for gateway compatibility)
class LoginRequest(BaseModel):
    username: str  # holds the email
    password: str

# 3. User self-update
class UserProfileUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    allergies: Optional[str] = None
    typeClient: Optional[TypeClientEnum] = None

# 4. Admin-only role update
class RoleUpdate(BaseModel):
    role: RoleEnum
    matricule: Optional[str] = None
    poste: Optional[str] = None
    status: Optional[str] = None
    horaires: Optional[str] = None

# 5. Response (password excluded)
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

class Token(BaseModel):
    access_token: str
    token_type: str

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