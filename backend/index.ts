import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
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

// CORS Configuration
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
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
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  console.log('📋 Request details:', {
    method: req.method,
    url: req.url,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'authorization': req.headers.authorization ? 'Present' : 'Missing',
      'x-clerk-id': req.headers['x-clerk-id'] ? 'Present' : 'Missing'
    },
    body: req.body ? 'Present' : 'Empty',
    query: Object.keys(req.query).length > 0 ? req.query : 'None'
  });
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/project-summaries', projectSummaryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to the DevProposals API with TypeScript and MongoDB!',
    version: '1.0.0',
    cors: {
      enabled: true,
      origins: corsOptions.origin.toString(),
      credentials: corsOptions.credentials
    }
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'DevProposals API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    models: ['User', 'Project', 'Proposal'],
    auth: {
      provider: 'Clerk',
      endpoints: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'GET /api/auth/me',
        'PUT /api/auth/me',
        'GET /api/auth/users',
        'PUT /api/auth/users/:userId/role',
        'POST /api/auth/logout'
      ]
    },
    projects: {
      endpoints: [
        'POST /api/projects',
        'GET /api/projects',
        'GET /api/projects/:projectId',
        'PUT /api/projects/:projectId',
        'DELETE /api/projects/:projectId'
      ]
    },
    projectSummaries: {
      endpoints: [
        'POST /api/project-summaries/:projectId',
        'GET /api/project-summaries/:projectId',
        'PUT /api/project-summaries/:projectId',
        'DELETE /api/project-summaries/:projectId'
      ]
    },
    upload: {
      endpoints: [
        'POST /api/upload/document'
      ]
    },
    cors: {
      enabled: true,
      credentials: true,
      methods: corsOptions.methods
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'PUT /api/auth/me',
      'GET /api/auth/users',
      'PUT /api/auth/users/:userId/role',
      'POST /api/auth/logout',
      'POST /api/projects',
      'GET /api/projects',
      'GET /api/projects/:projectId',
      'PUT /api/projects/:projectId',
      'DELETE /api/projects/:projectId',
      'POST /api/project-summaries/:projectId',
      'GET /api/project-summaries/:projectId',
      'PUT /api/project-summaries/:projectId',
      'DELETE /api/project-summaries/:projectId',
      'POST /api/upload/document'
    ]
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔒 CORS enabled with credentials support`);
  console.log(`🌍 Allowed origins: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}); 