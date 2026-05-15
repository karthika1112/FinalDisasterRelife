# Smart Disaster Relief Management System

A full-stack MERN application for coordinating disaster relief operations.

## Tech Stack
- **Frontend**: React.js, React Router v6, Axios, CSS
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB Atlas
- **File Upload**: Multer

## Project Structure
```
FinalDisasterRelife/
├── backend/
│   ├── config/          # DB connection, Multer config
│   ├── controllers/     # Business logic (auth, disaster, relief, volunteer, admin)
│   ├── middleware/      # JWT auth, error handler
│   ├── models/          # Mongoose schemas (User, Disaster, ReliefRequest, Volunteer)
│   ├── routes/          # Express route definitions
│   ├── uploads/         # Uploaded images (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Admin/       # AdminDashboard
    │   │   ├── Auth/        # Login, Register
    │   │   ├── Disaster/    # DisasterList, DisasterDetail, ReportDisaster
    │   │   ├── Layout/      # Navbar, PrivateRoute
    │   │   ├── Relief/      # ReliefRequests
    │   │   └── Volunteer/   # VolunteerPanel
    │   ├── context/         # AuthContext (global state)
    │   ├── pages/           # Home
    │   ├── services/        # api.js (Axios calls)
    │   ├── styles/          # global.css
    │   ├── App.js
    │   └── index.js
    ├── .env.example
    └── package.json
```

## Features
- JWT-based authentication with role-based access (User / Volunteer / Admin)
- Disaster reporting with image upload, type, severity, location
- Relief requests for food, shelter, and medical aid
- Volunteer registration and assignment to disaster zones
- Admin dashboard with analytics, user management, volunteer assignment
- Real-time status tracking and rescue updates

## Setup & Installation

### 1. Clone / Navigate to project
```bash
cd FinalDisasterRelife
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### 4. Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/disaster_relief
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |
| GET | /api/disasters | Public |
| POST | /api/disasters | Private |
| PUT | /api/disasters/:id | Admin/Volunteer |
| DELETE | /api/disasters/:id | Admin |
| POST | /api/disasters/:id/updates | Admin/Volunteer |
| GET | /api/relief | Private |
| POST | /api/relief | Private |
| PUT | /api/relief/:id | Admin/Volunteer |
| GET | /api/volunteers | Private |
| POST | /api/volunteers/register | Private |
| POST | /api/volunteers/assign | Admin |
| GET | /api/admin/analytics | Admin |
| GET | /api/admin/users | Admin |
| PUT | /api/admin/users/:id | Admin |
| DELETE | /api/admin/users/:id | Admin |

## Default Ports
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
