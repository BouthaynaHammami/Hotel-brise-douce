<div align="center">

# 🏨 Hôtel Brise Douce

**Plateforme de gestion hôtelière full-stack**

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/statut-Production%20Ready-brightgreen?style=flat-square)
![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Angular](https://img.shields.io/badge/Angular-18-red?style=flat-square&logo=angular)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot)
![Mise à jour](https://img.shields.io/badge/mise%20à%20jour-Avril%202026-lightgrey?style=flat-square)

> 💡 Solution complète basée sur une architecture microservices robuste avec une interface moderne et performante.

</div>

---

## 🧭 Navigation rapide

| Section | Description |
|---|---|
| [🔍 Vue d'ensemble](#-vue-densemble) | Présentation générale du projet |
| [🏗️ Architecture](#️-architecture-globale) | Schéma d'architecture microservices |
| [🚀 Démarrage rapide](#-démarrage-rapide) | Lancer le projet en quelques minutes |
| [📁 Structure du projet](#-structure-du-projet) | Organisation des dossiers |
| [🛠️ Stack technique](#️-stack-technique) | Technologies utilisées |
| [📦 Backend](#-backend) | Services, API, authentification |
| [🎨 Frontend](#-frontend) | Application Angular 18 |
| [🌐 Accès aux services](#-accès-aux-services) | URLs et ports |
| [🆘 Dépannage](#-dépannage) | Résolution des problèmes courants |

---

## 🔍 Vue d'ensemble

### ⚙️ Backend

- Architecture **microservices** (9 services indépendants)
- **API Gateway** centralisée comme point d'entrée unique
- **Service Discovery** via Eureka
- **Configuration centralisée** via Config Server
- Communication asynchrone via **RabbitMQ**
- Persistance avec **MySQL**
- Authentification sécurisée avec **Keycloak** (OAuth2 / JWT)

### 🎨 Frontend

- Application **Angular 18** moderne et responsive
- **Server-Side Rendering** (SSR) pour de meilleures performances
- Interface intuitive avec gestion complète de l'authentification

---

## 🏗️ Architecture globale

```
┌─────────────────────────────────────────────┐
│           Frontend (Angular 18)             │
│              localhost:4200                 │
└──────────────────┬──────────────────────────┘
                   │ HTTP
                   ▼
┌─────────────────────────────────────────────┐
│              API Gateway                    │
│              localhost:8081                 │
└────┬────┬────┬────┬────┬────┬────┬──────────┘
     │    │    │    │    │    │    │
     ▼    ▼    ▼    ▼    ▼    ▼    ▼
  Clients  Chambres  Réservations  Personnel
  Maintenance   Avis   Utilisateurs (Python)

┌─────────────────────────────────────────────┐
│           Services d'infrastructure         │
│   Eureka :8761  │  RabbitMQ :15672          │
│   Config Server │  Keycloak :8080/auth      │
│   MySQL                                     │
└─────────────────────────────────────────────┘
```

---

## 🚀 Démarrage rapide

### 🐳 Option recommandée — Docker

```bash
# 1. Démarrer le backend
cd hote-brise-douce-backend
docker-compose up -d

# 2. Démarrer le frontend
cd ../hote-brise-douce-frontend
npm install
npm start
```

👉 Accès : **http://localhost:4200**

---

### 🔧 Option manuelle

**Backend**
```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

**Frontend**
```bash
npm install
npm start
```

---

## 📁 Structure du projet

```
📦 IntegrationFinales
 ┣ 📂 backend/
 ┃ ┣ 📁 api-gateway/          # Point d'entrée centralisé
 ┃ ┣ 📁 discovery/            # Eureka Service Registry
 ┃ ┣ 📁 config-server/        # Configuration centralisée
 ┃ ┣ 📁 service-clients/      # Gestion des clients
 ┃ ┣ 📁 service-chambres/     # Gestion des chambres
 ┃ ┣ 📁 service-reservations/ # Réservations
 ┃ ┣ 📁 service-maintenance/  # Maintenance
 ┃ ┣ 📁 service-personnel/    # Ressources humaines
 ┃ ┣ 📁 service-avis/         # Avis & Feedback
 ┃ ┗ 📁 service-utilisateurs/ # Authentification (Python)
 ┗ 📂 frontend/
   ┣ 📁 components/           # Composants réutilisables
   ┣ 📁 pages/                # Pages métier
   ┣ 📁 services/             # Services API
   ┗ 📁 models/               # Modèles de données
```

---

## 🛠️ Stack technique

### Backend

| Technologie | Version | Usage |
|---|---|---|
| Java | 17 | Langage principal |
| Spring Boot | 3.x | Framework applicatif |
| Spring Cloud | — | Eureka, Config, Gateway |
| RabbitMQ | — | Messaging asynchrone |
| MySQL | — | Persistance des données |
| Keycloak | — | Authentification OAuth2/JWT |
| Docker | — | Conteneurisation |

### Frontend

| Technologie | Usage |
|---|---|
| Angular 18 | Framework frontend |
| TypeScript | Langage typé |
| RxJS | Programmation réactive |
| Angular Universal | Server-Side Rendering |
| Express | Serveur SSR |

---

## 📦 Backend

### 🔹 Microservices

| Service | Rôle | Port |
|---|---|---|
| API Gateway | Point d'entrée unique | `8081` |
| Service Avis | Feedback & avis | `8082` |
| Service Chambres | Gestion des chambres | `8083` |
| Service Clients | Gestion des clients | `8084` |
| Service Maintenance | Suivi de maintenance | `8085` |
| Service Personnel | Ressources humaines | `8086` |
| Service Réservations | Gestion des réservations | `8087` |
| Service Utilisateurs | Auth (Python) | `8000` |
| Discovery (Eureka) | Registre des services | `8761` |
| Config Server | Configuration centralisée | `8888` |

### ⚙️ Lancement

```bash
docker-compose up -d
```

### 🔐 Authentification

- Basée sur **Keycloak**
- Support **OAuth2 / JWT**
- Gestion des rôles et permissions

### 📡 Exemples d'API

```http
GET    /api/clients
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

---

## 🎨 Frontend

### ⚙️ Installation & lancement

```bash
npm install   # Installer les dépendances
npm start     # Démarrer en développement
npm run build # Build de production
npm test      # Lancer les tests
```

### 🧩 Architecture Angular

- **Composants** réutilisables et modulaires
- **Pages** métier avec routing lazy loading
- **Services** pour la communication API
- **Guards & Interceptors** pour la sécurité
- **SSR** intégré avec Angular Universal

### ⚡ Optimisations performances

- 🔄 **Lazy Loading** des modules
- ⚡ **AOT Compilation**
- 🖥️ **Server-Side Rendering**
- 🌳 **Tree Shaking**

---

## 🌐 Accès aux services

| Service | URL | Identifiants par défaut |
|---|---|---|
| Frontend | http://localhost:4200 | — |
| API Gateway | http://localhost:8081 | — |
| Eureka Dashboard | http://localhost:8761 | — |
| RabbitMQ Console | http://localhost:15672 | `guest` / `guest` |
| Keycloak Admin | http://localhost:8080/auth | — |

---

## 💻 Commandes essentielles

### Backend (Docker)

```bash
docker-compose up -d        # Démarrer tous les services
docker-compose down         # Arrêter tous les services
docker-compose logs -f      # Suivre les logs en temps réel
docker-compose ps           # Voir l'état des conteneurs
```

### Frontend

```bash
npm start       # Démarrer le serveur de développement
npm run build   # Build de production
npm test        # Lancer les tests unitaires
```

---

## 🆘 Dépannage

<details>
<summary><strong>❌ Backend inaccessible</strong></summary>

1. Vérifier que l'**API Gateway** est démarrée : `docker-compose ps`
2. Consulter les logs : `docker-compose logs api-gateway`
3. S'assurer que le port `8081` n'est pas déjà utilisé

</details>

<details>
<summary><strong>❌ Services absents dans Eureka</strong></summary>

1. Patienter **30–60 secondes** après le démarrage (heartbeat initial)
2. Vérifier la configuration dans le Config Server
3. Consulter : http://localhost:8761

</details>

<details>
<summary><strong>❌ Problème de base de données</strong></summary>

```bash
# Réinitialiser les volumes Docker
docker-compose down -v
docker-compose up -d
```

</details>

<details>
<summary><strong>❌ Erreur npm install</strong></summary>

```bash
# Vider le cache npm
npm cache clean --force
rm -rf node_modules
npm install
```

</details>

---

## 👥 Contribution

```bash
# 1. Créer une branche feature
git checkout -b feature/nom-de-la-feature

# 2. Commiter vos changements
git commit -m "feat: description de la feature"

# 3. Pousser la branche
git push origin feature/nom-de-la-feature

# 4. Ouvrir une Pull Request
```

**Convention de commits** : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

---

## 📄 Licence

Ce projet est développé dans un cadre **académique**.

> © 2026 — **DevUnity** & **ESPRIT** — Tous droits réservés

---

<div align="center">

**📌 Informations**

| Propriété | Valeur |
|---|---|
| Version | `1.0.0` |
| Statut | ✅ Production Ready |
| Mise à jour | Avril 2026 |
| Équipe | DevUnity @ ESPRIT |

---

**📞 Support**

✔ Vérifier les logs Docker → `docker-compose logs -f`  
✔ Tester les endpoints → http://localhost:8081  
✔ Consulter les dashboards → [Eureka](http://localhost:8761) • [RabbitMQ](http://localhost:15672)

</div>
