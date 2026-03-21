# 🏨 DevUnity – Hotel Brise Douce

🌟 Présentation
  DevUnity – Hotel Brise Douce est une plateforme moderne de gestion hôtelière basée sur une architecture microservices.
  Elle permet de digitaliser et centraliser toutes les opérations d’un hôtel afin de :
  Simplifier la gestion quotidienne
  Automatiser les processus
  Améliorer l’expérience client
  Optimiser la productivité du personnel
  
🏗️ Architecture
  Le système repose sur une architecture distribuée et scalable :
  🎨 Frontend : Angular
  ⚙️ Backend : Microservices (Spring Boot & Django)
  🌐 API Gateway : Gestion centralisée des requêtes
  🔐 Authentification & Sécurité : Keycloak
  🐳 Conteneurisation : Docker
  📡 Service Discovery : Netflix Eureka
  🗄️ Bases de données : MySQL & PostgreSQL
  
🚀 Fonctionnalités

  👤 Gestion des Clients
  Création et modification des profils
  Historique des séjours
  Gestion des préférences
  Classification (VIP, fidèle, entreprise…)
  Archivage des clients inactifs
  Import / export
  Notes internes
  
  🛏️ Gestion des Chambres
  CRUD des chambres
  Types (simple, double, suite…)
  Gestion des équipements
  Tarification
  Statuts (active, maintenance…)
  Upload de photos
  Organisation par étage
  
  📅 Gestion des Réservations
  Création / modification / annulation
  Calendrier de disponibilité
  Attribution automatique
  Check-in / Check-out
  Calcul des coûts
  Confirmation (PDF / email)
  Réservations de groupe
  
  🧹 Nettoyage & Maintenance
  Planification des tâches
  Suivi des interventions
  Historique
  Maintenance préventive
  Alertes urgentes
  
  👨‍💼 Gestion du Personnel
  Fiches employés
  Planning
  Affectations
  Congés et absences
  Documents administratifs
  Évaluation
  
  ⭐ Avis & Réclamations
  Collecte des avis
  Gestion des tickets
  Attribution et suivi
  Statistiques de satisfaction
  
  🔐 Gestion des Utilisateurs
  Comptes utilisateurs
  Rôles et permissions
  Authentification sécurisée
  Journal d’activité
  Gestion des accès
  
🐳 Installation
  1️⃣ Cloner le projet
  git clone https://github.com/BouthaynaHammami/devunity-hotel-brise-douce.git
  cd devunity-hotel-brise-douce
  2️⃣ Lancer avec Docker
  docker-compose up --build
  
🌐 Accès aux services
  Service	URL
  Frontend	http://localhost:4200
  API Gateway	http://localhost:8081
  Keycloak	http://localhost:8088

📁 Structure du projet
  /frontend        → Angular App
  /api-gateway     → Gateway
  /services        → Microservices
  /auth            → Keycloak
  /config          → Config Server
  /docker          → Docker setup

👨‍💻 Équipe
  DevUnity Team
    Saif Elislem Ben Youssef
    Shayma Tlili
    Hiba Jalassi
    Islem Raissi
    Bouthayna Hammami
    Marwa Chaibi
