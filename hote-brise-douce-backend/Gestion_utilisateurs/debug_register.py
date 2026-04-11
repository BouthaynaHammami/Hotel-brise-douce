import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import pathlib

# 1. Load configuration
env_path = pathlib.Path(__file__).parent / ".env"
load_dotenv(dotenv_path=str(env_path))

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "hotel_db_utilisateur")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"--- Diagnostique de Connexion ---")
print(f"URL: mysql+pymysql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}")

try:
    # 2. Test Connection
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("✓ Connexion à la base de données réussie !")
        
        # 3. Check Table
        result = conn.execute(text("SHOW TABLES LIKE 'utilisateurs'"))
        table_exists = result.fetchone()
        if table_exists:
            print("✓ La table 'utilisateurs' existe.")
            
            # 4. Check Columns
            columns = conn.execute(text("DESCRIBE utilisateurs"))
            print("\nColonnes trouvées dans 'utilisateurs' :")
            for col in columns:
                print(f" - {col[0]} ({col[1]})")
        else:
            print("✗ La table 'utilisateurs' est ABSENTE de la base de données.")
            print("Conseil : Redémarrez le serveur FastAPI pour qu'il crée les tables automatiquement.")

except Exception as e:
    print(f"\n✗ ERREUR CRITIQUE détectée :")
    print(f"Détails : {e}")
    
    if "Unknown database" in str(e):
        print(f"\n-> LA CAUSE : La base de données '{DB_NAME}' n'existe pas dans votre MySQL.")
        print(f"-> SOLUTION : Créez-la dans PhpMyAdmin ou vérifiez le nom dans le fichier .env.")
    elif "Access denied" in str(e):
        print(f"\n-> LA CAUSE : Le mot de passe ou l'utilisateur MySQL est incorrect.")
    elif "Can't connect to MySQL server" in str(e):
        print(f"\n-> LA CAUSE : Votre serveur MySQL (XAMPP) n'est pas lancé.")
