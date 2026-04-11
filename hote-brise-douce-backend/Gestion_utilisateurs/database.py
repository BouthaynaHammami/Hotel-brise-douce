import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load .env file with explicit path
try:
    from dotenv import load_dotenv
    import pathlib
    env_path = pathlib.Path(__file__).parent / ".env"
    print(f" [DEBUG] Looking for .env at: {env_path}")
    load_dotenv(dotenv_path=str(env_path), verbose=True)
except ImportError:
    print(" [WARNING] python-dotenv not installed, using default values or system env vars")
except Exception as e:
    print(f" [WARNING] Error loading .env: {e}")

# Load database configuration from environment variables
DB_USER     = os.getenv("DB_USER", "root")
# Default password for XAMPP setup - override with .env if needed
DB_PASSWORD = os.getenv("DB_PASSWORD", "Base_Securisee_123")
DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = os.getenv("DB_PORT", "3306")
DB_NAME     = os.getenv("DB_NAME", "hotel_db_utilisateur")

# Validate that required values are present
if not DB_USER:
    raise ValueError("DB_USER environment variable or default is empty!")
if not DB_HOST:
    raise ValueError("DB_HOST environment variable or default is empty!")
if not DB_PORT:
    raise ValueError("DB_PORT environment variable or default is empty!")
if not DB_NAME:
    raise ValueError("DB_NAME environment variable or default is empty!")

# Build connection URL with proper password handling
if DB_PASSWORD:
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Print masked URL for debugging
masked_pwd = "****" if DB_PASSWORD else "(NO PASSWORD)"
print(f" [INFO] Database Config: user={DB_USER}, host={DB_HOST}:{DB_PORT}, db={DB_NAME}, password={masked_pwd}")

# Create database if it does not exist (like Spring Boot's createDatabaseIfNotExist=true)
try:
    import pymysql
    tmp_conn = pymysql.connect(host=DB_HOST, port=int(DB_PORT), user=DB_USER, password=DB_PASSWORD)
    with tmp_conn.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`")
    tmp_conn.close()
    print(f" [INFO] Database `{DB_NAME}` verified/created successfully.")
except Exception as e:
    print(f" [WARNING] Could not auto-create database (might exist already): {e}")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
