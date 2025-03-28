import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from './errorHandler';

// Generic validation middleware for Zod schemas
export const validateRequest = <T extends AnyZodObject>(
  schema: T,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request data against schema
      const data = await schema.parseAsync(req[source]);
      
      // Replace request data with validated data
      req[source] = data;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Create error message from validation errors
        const errorMessage = error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        next(new ApiError(400, `Validation failed: ${errorMessage}`, true));
        return;
      }
      
      next(error);
    }
  };
}; 