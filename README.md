# Election Data App

A full-stack, production-ready application built for viewing and analyzing election constituency data. 

This project was developed as part of a technical assessment but has been fully deployed to a live cloud environment to demonstrate complete end-to-end full-stack capabilities, including DevOps, cloud hosting, and mobile build pipelines.

## 🚀 Live Demo

- **Web Dashboard:** [https://election-app.fyai.in](https://election-app.fyai.in)
- **Backend API (Swagger):** [https://election-api.fyai.in/docs](https://election-api.fyai.in/docs)
- **Mobile APK Download:** [https://election-app-download.fyai.in](https://election-app-download.fyai.in)

### 🔐 Test Credentials
To access the protected analytics dashboard or execute secured API endpoints via Swagger UI, please use the following credentials:
- **Username:** `admin`
- **Password:** `password123`

## 🏗️ Architecture & Tech Stack

This project is a monorepo consisting of three distinct services:

1. **Backend (`/backend`)**
   - **Framework:** Python / FastAPI
   - **Database:** SQLite (SQLAlchemy ORM)
   - **Security:** JWT Authentication (OAuth2 Password Bearer)
   - **Hosting:** Render

2. **Web Dashboard (`/web`)**
   - **Framework:** React (Vite)
   - **Styling:** Custom CSS
   - **Hosting:** Vercel

3. **Mobile App (`/mobile`)**
   - **Framework:** React Native (Expo)
   - **Features:** Offline-capable caching, REST API integration
   - **Build Pipeline:** EAS Build (Expo Application Services)

## 🛠️ Local Development

If you prefer to run the application locally instead of using the live URLs, you can easily spin up the entire stack using Docker.

### Prerequisites
- Docker & Docker Compose

### Running the App
1. Clone the repository.
2. Run the following command from the root directory:
   ```bash
   docker-compose up --build
   ```
3. The services will be available at:
   - **Backend:** `http://localhost:8000`
   - **Frontend:** `http://localhost:5173`

*(Note: The mobile application can be tested locally using the Expo Go app by running `npm run start` inside the `/mobile` directory).*
