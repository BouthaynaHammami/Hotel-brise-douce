from sqlalchemy.orm import Session
from datetime import date
import models, schemas, auth

def get_user_by_email(db: Session, email: str):
    return db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()

def get_users(db: Session):
    return db.query(models.Utilisateur).all()
    
def get_user(db: Session, user_id: int):
    return db.query(models.Utilisateur).filter(models.Utilisateur.idUtilisateur == user_id).first()

def delete_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    if user:
        db.delete(user)
        db.commit()
    return user

def register_user(db: Session, user_data: schemas.UserRegister):
    hashed_password = auth.get_password_hash(user_data.motDePasse)
    # Start as blank client with minimal fields
    db_user = models.Utilisateur(
        nom=user_data.nom,
        prenom=user_data.prenom,
        email=user_data.email,
        motDePasse=hashed_password,
        telephone=user_data.telephone,
        role=models.RoleEnum.CLIENT # Default role safely locked to CLIENT
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: int, profile_data: schemas.UserProfileUpdate):
    user = get_user(db, user_id)
    if not user:
        return None
    
    # Dict parsing with Pydantic backward/forward compatibility
    update_data = profile_data.model_dump(exclude_unset=True) if hasattr(profile_data, 'model_dump') else profile_data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user

def update_user_role_admin(db: Session, user_id: int, role_data: schemas.RoleUpdate):
    user = get_user(db, user_id)
    if not user:
        return None
    
    update_data = role_data.model_dump(exclude_unset=True) if hasattr(role_data, 'model_dump') else role_data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(user, key, value)
        
    # Generate auto matricule etc if admin didn't provide one when pushing to PERSONNEL
    if role_data.role == models.RoleEnum.PERSONNEL and not user.matricule:
        user.matricule = f"EMP-{user.idUtilisateur}"
        user.dateEmbauche = date.today()
        user.status = "Actif"
        
    db.commit()
    db.refresh(user)
    return user

def create_notification(db: Session, user_id: int, titre: str, message: str):
    db_notification = models.Notification(
        idUtilisateur=user_id,
        titre=titre,
        message=message
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_user_notifications(db: Session, user_id: int):
    return db.query(models.Notification).filter(models.Notification.idUtilisateur == user_id).order_by(models.Notification.dateCreation.desc()).all()

def mark_notification_as_read(db: Session, notification_id: int):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if notification:
        notification.lue = True
        db.commit()
        db.refresh(notification)
    return notification
