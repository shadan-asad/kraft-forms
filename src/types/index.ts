// Common type definitions for the application

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Standard API response format
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

// JWT token payload
export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

// User interfaces
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UserWithPassword extends User {
  password: string;
}

// Form interfaces
export interface FormField {
  id: string;
  fieldId: string;
  type: 'string' | 'number' | 'boolean';
  label: string;
  required: boolean;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  fields: FormField[];
}

export interface FormResponse {
  fieldId: string;
  value: string | number | boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: Date;
  responses: Record<string, string | number | boolean>;
} 