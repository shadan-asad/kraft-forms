import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../services/dbService';
import { ApiError } from '../middlewares/errorHandler';
import { LoginInput, RegisterInput } from '../validations/authValidation';

// Generate JWT token
const generateToken = (id: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  
  // Convert secret to Buffer which is compatible with the jwt.sign method
  const secretBuffer = Buffer.from(jwtSecret, 'utf-8');
  
  return jwt.sign(
    { id, email },
    secretBuffer,
    { expiresIn } as SignOptions
  );
};

// Register new user
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      throw new ApiError(400, 'User with this email or username already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });
    
    // Generate token
    const token = generateToken(newUser.id, newUser.email);
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user.id, user.email);
    
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = (
  _req: Request,
  res: Response
): void => {
  // In a stateless JWT auth, we don't need to do anything server-side
  // The client is responsible for removing the token
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
}; 