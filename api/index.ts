import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:4173",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://8lm4xlg4-3002.euw.devtunnels.ms",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://192.168.43.74:3000",
    "http://192.168.1.12:3000",
    "http://192.168.137.254:3000",
    "http://192.168.137.162:3000",
    "http://192.168.1.249:3000",
    "http://192.168.1.251:3000",
    "http://192.168.1.249:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// Middleware
app.use(compression());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// API routes placeholder
app.use('/api', (req, res) => {
  res.json({ message: 'API endpoints will be available here' });
});

export default app; 