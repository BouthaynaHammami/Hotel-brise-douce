from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional
from models import RoleEnum, TypeClientEnum

class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    telephone: str

# 1. Registration input (Only basics + password required)
class UserRegister(UtilisateurBase):
    motDePasse: str

# 2. Update allowed by User themselves (e.g. updating allergies, name)
class UserProfileUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    allergies: Optional[str] = None
    typeClient: Optional[TypeClientEnum] = None

# 3. Role and deep updates allowed ONLY by Admin
class RoleUpdate(BaseModel):
    role: RoleEnum
    matricule: Optional[str] = None
    poste: Optional[str] = None
    status: Optional[str] = None
    horaires: Optional[str] = None

# Output formatting to hide password but show all available columns as nullable
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
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
