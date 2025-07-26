import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';


// Extend Request interface to include file
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb: FileFilterCallback) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});



// Upload single file
router.post('/document', authenticateToken, upload.single('document'), (req: RequestWithFile, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    // Generate the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upload file'
    });
  }
});

// Error handling middleware for multer
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      error: 'Upload Error',
      message: error.message
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'File upload failed'
  });
});

export default router; 