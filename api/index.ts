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

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Restaurant POS API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

export default app; 