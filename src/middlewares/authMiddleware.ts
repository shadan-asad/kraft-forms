import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for JWT payload
interface JwtPayload {
  id: string;
  email: string;
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

// Middleware to authenticate users
export const authenticate = async (
  req: Request, 
  _res: Response, 
  next: NextFunction
) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Authentication token missing.');
    }
    
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true }
    });
    
    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid or expired token.'));
    } else {
      next(error);
    }
  }
};

// Middleware to check form ownership
export const checkFormOwnership = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const formId = req.params.form_id;
    const userId = req.user?.id;

    if (!formId || !userId) {
      throw new ApiError(400, 'Form ID or user ID missing');
    }

    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    if (form.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to access this form');
    }

    next();
  } catch (error) {
    next(error);
  }
}; 