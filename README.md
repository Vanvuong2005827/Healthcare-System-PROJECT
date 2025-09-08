# 🏥 Healthcare Management System  

![Java](https://img.shields.io/badge/Java-17-blue)  
![Spring Boot](https://img.shields.io/badge/SpringBoot-3-green)  
![Docker](https://img.shields.io/badge/Docker-Compose-blue)  
![Python](https://img.shields.io/badge/Python-FastAPI-yellow)  
![License](https://img.shields.io/badge/License-MIT-lightgrey)  

> **Microservices Architecture | Spring Boot 3 | Spring Cloud | Docker Compose | React | FastAPI**

---

## 📌 Overview  

The **Healthcare Management System** is a **microservices-based platform** designed to streamline and modernize healthcare operations such as patient management, doctor availability, pharmaceutical inventory, notifications, and research analytics.  

It combines **Java Spring Boot** for backend services, **ReactJS** for the frontend, **Python FastAPI** for the AI-powered chatbot (**HealthBot**), and **Docker Compose** for orchestration.  

---

## 🛠️ Tech Stack  

- **Backend:** Spring Boot 3, Spring Cloud, Eureka, Config Server  
- **Frontend:** ReactJS  
- **AI Chatbot:** Python FastAPI, NLP pipeline  
- **Databases:** MySQL  
- **Cache & Recovery:** Redis  
- **Orchestration:** Docker Compose  
- **Tracing & Monitoring:** Zipkin, Sleuth  
- **Cloud Networking:** Cloudflare  

---

## 📂 Project Structure  

```bash
Healthcare-System-PROJECT/
│── analytic-research-service/        # Data research & analytics
│── api-gateway/                      # API Gateway
│── cdss-service/                     # Clinical Decision Support System
│── community-portal-service/         # Community portal
│── config-server/                    # Centralized config
│── doctor-service/                   # Doctor management
│── eureka-service-discovery/         # Service registry
│── notification-service/             # Notification system (Redis)
│── patient-service/                  # Patient management
│── pharmaceutical-inventory-service/ # Pharmaceutical inventory
│── security-service/                  # Authentication & authorization
│── docker-compose.yml                # Docker orchestration
│── user_health_data-research.csv     # Research dataset
```
## ⚙️ Installation & Setup  

### 1️⃣ Requirements  
- Docker & Docker Compose  
- Java 17+  
- Node.js 18+  
- Python 3.10+  

---

### 2️⃣ Clone & Run  
# Clone repository
git clone https://github.com/Vanvuong2005827/Healthcare-System-PROJECT.git
cd Healthcare-System-PROJECT

# Run all services
docker-compose up --build

### 3️⃣ Access Services  

- **API Gateway:** http://localhost:8080  
- **React Frontend:** http://localhost:3000  
- **Eureka Dashboard:** http://localhost:8761  
- **Zipkin Dashboard:** http://localhost:9411  

---

## 🤖 HealthBot  

The **HealthBot** is an AI-powered chatbot for healthcare guidance, built with **FastAPI (Python)**.  

### Features:  
- Web chat integration via **ReactJS**  
- Intent detection & routing (`router.py`)  
- Patient profile queries via **EHR API**  
- Advice & recommendations (`tools.py`)  
- Knowledge base using **YAML schemas**  
- Natural language responses (`composer.py`)  

---

## 📊 System Architecture  

- **Microservices**  
- **HealthBot Workflow**  
- **Database Schema**  
<img width="2250" height="1809" alt="Untitled Diagram-global-architecture drawio" src="https://github.com/user-attachments/assets/7ed0c27a-ee29-4146-8692-f142db0db937" />

---

## ✅ Core Features  

- Patient registration & management  
- Doctor availability & scheduling  
- Appointment booking  
- Pharmaceutical inventory management  
- Community portal for patient-doctor interactions  
- Notifications system with Redis recovery  
- AI chatbot for health consultation  
- Distributed tracing with Zipkin  
- Scalable microservices architecture  

---

## 👨‍💻 Contribution Guidelines
- Fork the project

- Create your feature branch: git checkout -b feature/my-feature

- Commit your changes: git commit -m 'Add new feature'

- Push to the branch: git push origin feature/my-feature

- Open a Pull Request

## 📜 License
- This project is released under the MIT License.

## 🙌 Acknowledgements
- Spring Boot & Spring Cloud Team

- FastAPI & Python community

- Docker & Cloudflare

Open-source healthcare research datasets
