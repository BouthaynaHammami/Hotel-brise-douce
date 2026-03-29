from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

import models, schemas, crud, auth
from database import engine, get_db

# Create table
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Microservice - Flat Arch.")

# ----------------- CORS SETTINGS -----------------
# Allow API consumption from the Angular frontend (CORS Policy Error bypass)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Origin of your Angular app
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, GET, PUT, etc.)
    allow_headers=["*"],  # Allows all headers
)

# ----------------- INSCRIPTION & LOGIN -----------------

@app.post("/register", response_model=schemas.UtilisateurResponse)
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    """ Create a new account. Basic parameters only. Inherits CLIENT role. """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.register_user(db=db, user_data=user)

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username) 
    if not user or not auth.verify_password(form_data.password, user.motDePasse):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ----------------- USER PROFILE -----------------
@app.put("/users/me/profile", response_model=schemas.UtilisateurResponse)
def update_my_profile(profile_data: schemas.UserProfileUpdate, current_user: models.Utilisateur = Depends(auth.get_current_active_user), db: Session = Depends(get_db)):
    """ Allows an authenticated user to customize their own client fields like 'allergies' safely """
    return crud.update_user_profile(db, current_user.idUtilisateur, profile_data)

# ----------------- INITIAL ADMIN SETUP -----------------
@app.post("/setup-initial-admin")
def setup_admin(db: Session = Depends(get_db)):
    """ Run this ONCE when DB is completely empty to gain Admin Access. """
    if db.query(models.Utilisateur).first():
        return {"message": "Users already exist. Setup blocked."}
    
    hashed_password = auth.get_password_hash("admin123")
    admin = models.Utilisateur(
        nom="Root",
        prenom="Admin",
        email="admin@hotel.com",
        motDePasse=hashed_password,
        telephone="0000",
        role=models.RoleEnum.ADMIN
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin created. email: admin@hotel.com | pwd: admin123"}

# ----------------- ADMIN CRUD (SECURED) -----------------
allow_admin = auth.RoleChecker([models.RoleEnum.ADMIN])

@app.get("/users", response_model=List[schemas.UtilisateurResponse])
def get_all_users(current_user: models.Utilisateur = Depends(allow_admin), db: Session = Depends(get_db)):
    return crud.get_users(db)

@app.put("/users/{user_id}/role", response_model=schemas.UtilisateurResponse)
def change_user_role(user_id: int, role_data: schemas.RoleUpdate, current_user: models.Utilisateur = Depends(allow_admin), db: Session = Depends(get_db)):
    """ ONLY ADMIN: Elevate users to PERSONNEL or ADMIN and link their structural params. """
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
