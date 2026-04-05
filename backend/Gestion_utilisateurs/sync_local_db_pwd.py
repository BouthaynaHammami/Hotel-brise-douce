import asyncio
import sys
from database import SessionLocal
import crud
import auth

db = SessionLocal()
user = crud.get_user_by_email(db, email="bouthayna@esprit.tn")
if user:
    print(f"User found. Hash: {user.motDePasse}")
    is_valid = auth.verify_password("Bouthayna", user.motDePasse)
    print(f"Is 'Bouthayna' the correct local password? {is_valid}")
    is_valid_admin = auth.verify_password("admin", user.motDePasse)
    print(f"Is 'admin' the correct local password? {is_valid_admin}")
    
    # Let's bypass Keycloak and check if old password was something else? No, we don't know it, but we can set the local DB to "Bouthayna"!
    new_hash = auth.get_password_hash("Bouthayna")
    user.motDePasse = new_hash
    db.commit()
    print("Force synced local DB password to 'Bouthayna'!")
else:
    print("User not found locally.")

db.close()
