import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.url}`);
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
}; 