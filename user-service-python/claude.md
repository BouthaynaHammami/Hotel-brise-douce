# Web Application Development Workflow
# Structure du Microservice Utilisateur (FastAPI)

Ce guide explique l'architecture du microservice de gestion des utilisateurs, construit avec FastAPI, SQLAlchemy (pour l'ORM) et Pydantic (pour la validation des données). La base de données utilisée est MySQL (via XAMPP).

## Arborescence du projet

```text
user-service/
├── main.py           # Point d'entrée de l'application FastAPI, définition des routes (endpoints)
├── database.py       # Configuration de la connexion à la base de données MySQL
├── models.py         # Modèles SQLAlchemy représentant les classes (Utilisateur, Client, Personnel)
├── schemas.py        # Modèles Pydantic pour la validation des données JSON
├── crud.py           # Fonctions pour interagir avec la base de données
├── auth.py           # Logique d'authentification (hashage des mots de passe, JWT, gestion des rôles)
└── requirements.txt  # Liste des dépendances Python
```

## Explication des fichiers

1.  **`database.py`** : Initie le moteur SQLAlchemy qui va communiquer avec votre base MySQL depuis XAMPP (sur `localhost:3306`).
2.  **`models.py`** : Définit la structure de vos données en fonction de votre diagramme de classe UML. L'héritage illustré (Utilisateur -> Client / Personnel) est géré grâce au *Polymorphism* dans des tables jointes.
3.  **`schemas.py`** : Définit la forme des requêtes, ce qui permet à FastAPI de valider les types de données automatiquement et de créer la documentation Swagger/Redoc.
4.  **`crud.py`** : Isole la logique des requêtes à la base.
5.  **`auth.py`** : Implémente la sécurité. On utilise JWT (JSON Web Tokens) pour l'authentification et bcrypt pour le hachage des mots de passe. Il intègre aussi les validateurs de rôles.
6.  **`main.py`** : Regroupe le tout et définit vos API endpoints (ex: `/register`, `/login`, vérifications des rôles).

## Instructions pour démarrer

1. Allumez **XAMPP** et démarrez **Apache** et **MySQL**.
2. Créez une nouvelle base de données appelée `hotel_db_user` via l'interface `phpMyAdmin` de XAMPP (ou changez simplement le nom dans `database.py`).
3. Installez Python sur votre machine si vous ne l'avez pas fait.
4. Ouvrez votre terminal (cmd ou powershell) dans ce dossier `user-service`.
5. Si désiré, créez et activez un environnement virtuel Python (`python -m venv venv`, puis `venv\Scripts\activate`).
6. Installez les dépendances:
   ```bash
   pip install -r requirements.txt
   ```
7. Démarrez l'application (le serveur de développement):
   ```bash
   uvicorn main:app --reload
   ```
8. La documentation complète de votre API (Swagger UI) sera alors accessible à l'adresse : `http://localhost:8000/docs`
