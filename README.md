# Full Stack Election Data Application

This project is a full-stack application built to track and display election constituency and booth data. It features a backend API, a React web dashboard, and a React Native mobile application.

## Architecture & Tech Choices
- **Backend**: FastAPI (Python). Chosen for its performance, ease of use, built-in validation (Pydantic), and automatic Swagger documentation.
- **Database**: SQLite with SQLAlchemy. Chosen because it's a file-based real relational database, requiring zero setup (no external PostgreSQL server needed) which is ideal for a reviewer testing locally.
- **Web App**: React (initialized via Vite). Uses Vanilla CSS for styling (per constraints) and Recharts for data visualization.
- **Mobile App**: React Native (via Expo). Chosen for its cross-platform ease of use and zero native compilation requirement for testing.

## Setup Instructions

Ensure you have Node.js and Python installed.

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - Windows (Command Prompt): `venv\Scripts\activate.bat`
   - Windows (PowerShell): `venv\Scripts\Activate.ps1`
   - Mac/Linux: `source venv/bin/activate`
3. Run the database seed script to generate mock data:
   ```bash
   python seed.py
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
5. The API is now running at `http://127.0.0.1:8000`. You can view the automatically generated API documentation at `http://127.0.0.1:8000/docs`.

### 2. Web Dashboard Setup
1. Open a new terminal and navigate to the `web` folder:
   ```bash
   cd web
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (usually `http://localhost:5173`) in your browser to view the dashboard.

### 3. Mobile App Setup
1. Open a new terminal and navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the Expo server:
   ```bash
   npm start
   ```
4. Press `a` in the terminal to run on an Android emulator, `i` for an iOS simulator, or scan the QR code with the Expo Go app on your physical device. Ensure your device is on the same Wi-Fi network as your computer, and update `API_URL` in `mobile/App.js` from `127.0.0.1` to your computer's local IP address if testing on a physical device.

## Future Improvements
Given more time, I would:
1. Implement a robust CI/CD pipeline using GitHub Actions to automatically run linting and tests on every push.
2. Add JWT-based Authentication to the web dashboard to secure the Analytics view.
3. Use a more robust state management solution (like Redux Toolkit or React Query) for better caching and offline support in the mobile app.
4. Integrate a Map library (e.g., `react-leaflet`) to visually plot booth locations based on geospatial coordinates.
