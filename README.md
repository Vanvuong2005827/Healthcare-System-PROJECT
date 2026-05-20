# HSM - Healthcare Management System

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen)
![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2022.0.4-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-7-646cff)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

HSM is a microservices-based healthcare management system for running the main workflows of a clinic or hospital: user accounts, patient records, doctor profiles, appointment booking, health recommendations, inventory, notifications, research access, community posts, and online consultation rooms.

The backend is built with Spring Boot and Spring Cloud. The frontend is a React/Vite application that talks to the system through the API Gateway. Docker Compose is used to run the backend services and shared infrastructure locally.

## Main Workflows

- Role-based access for Admin, Doctor, Patient, and Researcher accounts.
- Patient registration, approval, profile management, and health record tracking.
- Doctor registration, approval, department search, profile management, and room allocation.
- Appointment slot creation, booking, cancellation, upcoming appointments, and doctor/patient appointment views.
- Telemedicine rooms through ZegoCloud on the React client.
- CDSS health recommendations generated from patient health records using OpenAI.
- Doctor-written recommendations for patients, with create/edit/delete flows.
- Pharmaceutical inventory for medicines and medical equipment, including booking, returning, search, and expiry alerts.
- Community portal with posts, comments, votes, article publishing, likes, bookmarks, and article comments.
- Notification center with SMS, email, templated email, preferences, unread state, and read tracking.
- Researcher registration and controlled export of health data to CSV.

## Tech Stack

| Area | Technology |
| --- | --- |
| Backend services | Java 17, Spring Boot 3.1.5, Spring Web, Spring Security, Spring Data JPA |
| Microservices | Spring Cloud Gateway, Eureka Discovery Server, Spring Cloud Config, OpenFeign |
| Frontend | React 18, Vite, React Router, Axios, Material UI, Tailwind CSS, Sass |
| Database | MySQL 8.0 |
| Cache / recovery support | Redis |
| Observability | Spring Boot Actuator, Micrometer Tracing, Zipkin |
| External integrations | OpenAI, Twilio, SendGrid SMTP, Cloudinary, ZegoCloud |
| Local orchestration | Docker Compose |

## Services

| Service | Port | Responsibility |
| --- | ---: | --- |
| `api-gateway` | `8090` | Single entry point for frontend/API traffic and route forwarding |
| `security-service` | `8091` | User registration, login, JWT auth, roles, password recovery |
| `patient-service` | `8092` | Patient profiles, approval flow, health records |
| `doctor-service` | `8093` | Doctor profiles, departments, appointments, room allocation |
| `community-portal-service` | `8094` | Posts, comments, votes, articles, likes, bookmarks, Cloudinary uploads |
| `cdss-service` | `8095` | AI health recommendations and doctor-to-patient recommendations |
| `pharmaceutical-inventory-service` | `8096` | Medicine/equipment inventory, allocations, expiry alerts |
| `notification-service` | `8097` | In-app notifications, SMS, email, preferences |
| `analytic-research-service` | `8098` | Researcher registration, access approval, CSV health-data export |
| `config-server` | `8888` | Centralized Spring Cloud configuration |
| `eureka-service-discovery` | `8761` | Service registry |
| `zipkin` | `9411` | Distributed tracing UI |
| `mysql` | `3306` | Application databases and Zipkin storage |
| `redis` | internal | Redis cache/recovery store |

The React client is not part of `docker-compose.yml`. Run it separately during development.

## System Architecture

<img width="2250" height="1809" alt="Untitled Diagram-global-architecture drawio" src="https://github.com/user-attachments/assets/7ed0c27a-ee29-4146-8692-f142db0db937" />

## Project Structure

```text
HSM/
|-- analytic-research-service/        # Researcher workflow and CSV health-data export
|-- api-gateway/                      # Spring Cloud Gateway routes
|-- cdss-service/                     # Clinical decision support and recommendations
|-- community-portal-service/         # Posts, articles, comments, votes, uploads
|-- config-repo/                      # Mounted config repository for config-server
|-- config-server/                    # Spring Cloud Config Server
|-- doctor-service/                   # Doctor, appointment, and room management
|-- eureka-service-discovery/         # Eureka registry
|-- hsm-client/                       # React/Vite frontend
|-- init-scripts/                     # MySQL initialization scripts
|-- notification-service/             # Notifications, email, SMS, preferences
|-- patient-service/                  # Patient profiles and health records
|-- pharmaceutical-inventory-service/ # Medicine and medical equipment inventory
|-- security-service/                 # Auth, JWT, user recovery
|-- docker-compose.yml
|-- .env.example
`-- user_health_data-research.csv
```

## Run Locally

### Prerequisites

- Docker and Docker Compose
- Java 17 if running services outside Docker
- Node.js `20.19+` or `22.12+` and npm for the frontend (required by Vite 7)
- Valid credentials for external services you want to use: OpenAI, Twilio, SendGrid, Cloudinary

### 1. Configure environment variables

Copy the root template and fill in real values:

```bash
cp .env.example .env
```

Important variables:

- `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
- `JWT_TOKEN_SECRET`
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_API_URL`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `SENDGRID_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`

### 2. Start backend and infrastructure

```bash
docker compose up --build
```

Useful URLs:

- API Gateway: `http://localhost:8090`
- Eureka Dashboard: `http://localhost:8761`
- Config Server health: `http://localhost:8888/actuator/health`
- Zipkin Dashboard: `http://localhost:9411`
- MySQL: `localhost:3306`

### 3. Start the frontend

```bash
cd hsm-client
cp .env.example .env
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

By default, `hsm-client/src/config/apiConfig.js` points all frontend service clients to the API Gateway at `http://localhost:8090`.

## Gateway Routes

The gateway forwards requests by path:

| Path | Target service |
| --- | --- |
| `/users/**` | `security-service` |
| `/patients/**` | `patient-service` |
| `/doctors/**` | `doctor-service` |
| `/appointments/**` | `doctor-service` |
| `/rooms/**` | `doctor-service` |
| `/community-portal/**` | `community-portal-service` |
| `/cdss/**` | `cdss-service` |
| `/recommendation/**` | `cdss-service` |
| `/pharmaceutical-inventory/**` | `pharmaceutical-inventory-service` |
| `/notifications/**` | `notification-service` |
| `/research/**` | `analytic-research-service` |

## AI and Recommendations

There are two AI-related flows in the current codebase:

- `cdss-service` calls OpenAI from Spring Boot to generate health recommendations from a patient's health records, then stores the recommendation and creates a notification.
- The React health support chat UI calls the hosted endpoint `https://ai-chat.whodev.top/ask`. That service is integrated by the frontend but is not included in this repository or in `docker-compose.yml`.

## Development Commands

Run tests for a backend service:

```bash
cd patient-service
./mvnw test
```

On Windows PowerShell:

```powershell
cd patient-service
.\mvnw.cmd test
```

Frontend checks:

```bash
cd hsm-client
npm run lint
npm run build
```

## Notes

- Each Spring service has its own Maven wrapper, Dockerfile, and `application.properties`.
- Service-to-service communication uses OpenFeign and service discovery through Eureka.
- JWT is shared across secured services through `JWT_TOKEN_SECRET`.
- Zipkin stores trace data in the MySQL `zipkin` database created by `init-scripts/01-create-zipkin-db.sql`.
- The repository currently does not include a `LICENSE` file.
