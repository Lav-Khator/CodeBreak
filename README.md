# CodeBreak

CodeBreak is a lightweight Online Judge platform. Users can solve coding problems, participate in contests, and view real-time leaderboards. Code submissions are compiled and executed inside a secure, sandboxed Docker container.

## Tech Stack
* **Frontend:** React, Tailwind CSS, Vite, Monaco Editor
* **Backend:** Node.js, Express, MongoDB (Mongoose)
* **Execution Sandbox:** Docker (supports C++, Python, Java, JavaScript)
* **AI Features:** Google Gemini API (runs code feedback & hints)

## Requirements
* Node.js (v18+)
* MongoDB (Local instance or Atlas connection)
* Docker (installed and running on the host system)

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/Lav-Khator/CodeBreak.git
cd CodeBreak
```

### 2. Configure & Run Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/online_judge
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```
Start the development server:
```bash
npm run dev
```

### 3. Configure & Run Frontend
```bash
cd ../frontend
npm install
```
Start the frontend dev server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Sandbox Execution Details
The code execution engine runs in `backend/services/executor.js`. Submissions are mounted into ephemeral Docker containers with restricted memory (`256m`), process limits (`64` PIDs), and zero network access to prevent malicious code execution. Ensure the local Docker daemon is active when testing submissions.
