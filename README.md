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

## 🧠 Architecture & Connectivity

The application follows a standard client-server architecture with a centralized backend serving two distinct clients:

1. **Central API (FastAPI):** Acts as the single source of truth. It manages database connections, authenticates users via JWT, and exposes RESTful endpoints.
2. **Web Dashboard (React):** A protected client that consumes the secured `/api/constituencies` endpoints. It handles the JWT in local storage and visualizes the aggregate data for analytics teams.
3. **Mobile App (React Native):** A public-facing client utilized by field officers. It hits the public `/api/booths/search` endpoint. To fulfill the **offline capability** requirement, it utilizes `AsyncStorage` to cache previously searched booth data. If the device loses connection, it retrieves the results from the local device cache instead of the network.

## ⚖️ Key Tech Choices & Trade-offs

- **FastAPI over Django/Flask:** Chosen for its asynchronous capabilities, speed, and auto-generated OpenAPI (Swagger) documentation, which was critical for rapid API design.
- **SQLite over PostgreSQL:** Due to time constraints, SQLite was selected to eliminate database provisioning overhead. It is perfect for this scoped requirement, but a production environment would require a distributed SQL database.
- **React Native (Expo):** Selected for the mobile application to allow rapid cross-platform development and leverage Expo's EAS cloud build pipeline for seamless APK generation.
- **Trade-off - Simple JWT:** Implemented standard JWT access tokens. Due to time constraints, a robust "refresh token" rotation system was omitted.
- **Trade-off - Pagination:** The frontend dashboard currently fetches all constituencies at once. For a nationwide dataset, cursor-based pagination would be necessary.

## 🚀 Future Improvements (If Given More Time)

1. **Database Migration:** Upgrade from SQLite to PostgreSQL to handle high-concurrency read/writes during a live election scenario.
2. **Rate Limiting:** Implement Redis-backed rate limiting on the public mobile search endpoint to prevent abuse and DDoS attacks.
3. **Real-time Updates:** Replace standard REST polling with **WebSockets** to stream live voting numbers directly to the analytics dashboard in real-time.
4. **Testing Suite:** Add comprehensive test coverage using `PyTest` for the backend and `Jest` / `React Testing Library` for the frontend clients.
5. **Advanced Caching:** Use SQLite on the mobile device (via `expo-sqlite`) instead of `AsyncStorage` for more complex offline querying capabilities.
