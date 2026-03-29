from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum, Date
from datetime import datetime
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    ADMIN = 'ADMIN'
    CLIENT = 'CLIENT'
    PERSONNEL = 'PERSONNEL'

class TypeClientEnum(str, enum.Enum):
    VIP = 'VIP'
    NORMAL = 'NORMAL'
    ENTREPRISE = 'ENTREPRISE'

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    # Common required fields
    idUtilisateur = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    prenom = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    motDePasse = Column(String(255), nullable=False)
    telephone = Column(String(20), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.CLIENT)
    statusCompte = Column(Boolean, default=True)
    dateCreation = Column(DateTime, default=datetime.utcnow)
    dernierAccess = Column(DateTime, default=datetime.utcnow)

    # Client specific fields (nullable, only filled if client and edited)
    typeClient = Column(Enum(TypeClientEnum), default=TypeClientEnum.NORMAL, nullable=True)
    allergies = Column(String(255), nullable=True)
    dernierSejour = Column(Date, nullable=True)
    actif = Column(Boolean, default=True, nullable=True)

    # Personnel specific fields (nullable, filled by Admin during upgrade)
    matricule = Column(String(50), unique=True, nullable=True)
    poste = Column(String(100), nullable=True)
    dateEmbauche = Column(Date, nullable=True)
    status = Column(String(50), nullable=True)
    horaires = Column(String(100), nullable=True)
