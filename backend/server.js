require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,          // set this in Railway env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow REST clients (Postman, Railway health checks) + allowed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Disaster Relief Backend Running Successfully",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart Disaster Relief API is running",
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/disasters',  require('./routes/disasterRoutes'));
app.use('/api/relief',     require('./routes/reliefRoutes'));       // legacy alias
app.use('/api/requests',   require('./routes/requestRoutes'));      // canonical
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
