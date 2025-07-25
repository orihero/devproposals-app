import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { User, Project, Proposal } from './models';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import proposalRoutes from './routes/proposals';
import uploadRoutes from './routes/upload';
import projectSummaryRoutes from './routes/projectSummaries';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devproposals';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure temp directory exists for FileReader operations
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// CORS Configuration
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.error('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors(corsOptions));

// Security headers middleware
app.use((req: Request, res: Response, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/project-summaries', projectSummaryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the DevProposals API with TypeScript and MongoDB!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DevProposals API is running',
    models: ['User', 'Project', 'Proposal'],
    auth: {
      provider: 'Clerk',
      endpoints: [
        'GET /api/auth/me',
        'PUT /api/auth/me',
        'GET /api/auth/users',
        'PUT /api/auth/users/:userId/role'
      ]
    }
  });
});

app.listen(PORT, () => {
  console.error(`Backend API server running on http://localhost:${PORT}`);
}); 