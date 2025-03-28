import { z } from 'zod';

// Field type enumeration
const FieldTypeEnum = z.enum(['string', 'number', 'boolean']);

// Form field validation schema
const formFieldSchema = z.object({
  field_id: z.string().min(1, 'Field ID is required'),
  type: FieldTypeEnum,
  label: z.string().min(1, 'Label is required'),
  required: z.boolean().default(false),
});

// Create form validation schema
export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  fields: z.array(formFieldSchema).min(1, 'At least one field is required'),
});

// Form response validation schema
const formResponseSchema = z.object({
  field_id: z.string().min(1, 'Field ID is required'),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// Form submission validation schema
export const submitFormSchema = z.object({
  responses: z.array(formResponseSchema).min(1, 'At least one response is required'),
});

// Pagination parameters validation schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});

// Export type definitions
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>; 