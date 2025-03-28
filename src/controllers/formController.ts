import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/dbService';
import { ApiError } from '../middlewares/errorHandler';
import { CreateFormInput, SubmitFormInput } from '../validations/formValidation';
import { Prisma } from '@prisma/client';

// Create a new form
export const createForm = async (
  req: Request<{}, {}, CreateFormInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, fields } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    // Start a transaction to ensure all operations succeed or fail together
    const form = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the form
      const newForm = await tx.form.create({
        data: {
          title,
          description,
          userId
        }
      });

      // Create form fields
      const formFields = await Promise.all(
        fields.map(field => 
          tx.formField.create({
            data: {
              fieldId: field.field_id,
              type: field.type,
              label: field.label,
              required: field.required,
              formId: newForm.id
            }
          })
        )
      );

      return {
        ...newForm,
        fields: formFields
      };
    });

    res.status(201).json({
      status: 'success',
      message: 'Form created successfully',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

// Delete a form
export const deleteForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const formId = req.params.form_id;

    // Form ownership is already checked by middleware
    await prisma.form.delete({
      where: { id: formId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Form deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all forms for the authenticated user
export const getAllForms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const forms = await prisma.form.findMany({
      where: { userId },
      include: {
        fields: {
          select: {
            id: true,
            fieldId: true,
            type: true,
            label: true,
            required: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: forms
    });
  } catch (error) {
    next(error);
  }
};

// Get a single form by ID
export const getFormById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const formId = req.params.form_id;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          select: {
            id: true,
            fieldId: true,
            type: true,
            label: true,
            required: true
          }
        }
      }
    });

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    res.status(200).json({
      status: 'success',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

// Submit a form
export const submitForm = async (
  req: Request<{ form_id: string }, {}, SubmitFormInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { form_id } = req.params;
    const { responses } = req.body;

    // Check if form exists
    const form = await prisma.form.findUnique({
      where: { id: form_id },
      include: {
        fields: true
      }
    });

    if (!form) {
      throw new ApiError(404, 'Form not found');
    }

    // Check if all required fields are provided
    const requiredFields = form.fields
      .filter((field: { required: boolean }) => field.required)
      .map((field: { fieldId: string }) => field.fieldId);

    const submittedFieldIds = responses.map(r => r.field_id);
    
    const missingFields = requiredFields.filter(
      (fieldId: string) => !submittedFieldIds.includes(fieldId)
    );

    if (missingFields.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate field IDs
    const validFieldIds = form.fields.map((field: { fieldId: string }) => field.fieldId);
    const invalidFields = responses.filter(
      response => !validFieldIds.includes(response.field_id)
    );

    if (invalidFields.length > 0) {
      throw new ApiError(400, `Invalid field IDs: ${invalidFields.map(f => f.field_id).join(', ')}`);
    }

    // Create submission
    const submission = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create submission record
      const newSubmission = await tx.submission.create({
        data: {
          formId: form_id
        }
      });

      // Map field_id to actual field ID from the database
      const fieldIdMapping = form.fields.reduce(
        (acc: Record<string, string>, field: { fieldId: string; id: string }) => {
          acc[field.fieldId] = field.id;
          return acc;
        }, 
        {} as Record<string, string>
      );

      // Create field responses
      const fieldResponses = await Promise.all(
        responses.map(response => 
          tx.fieldResponse.create({
            data: {
              fieldId: fieldIdMapping[response.field_id],
              submissionId: newSubmission.id,
              value: String(response.value)
            }
          })
        )
      );

      return {
        ...newSubmission,
        responses: fieldResponses
      };
    });

    res.status(201).json({
      status: 'success',
      message: 'Form submitted successfully',
      data: {
        submission_id: submission.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get form submissions
export const getFormSubmissions = async (
  req: Request<{ form_id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { form_id } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Form ownership is already checked by middleware

    // Get total count for pagination
    const totalCount = await prisma.submission.count({
      where: { formId: form_id }
    });

    // Get submissions with pagination
    const submissions = await prisma.submission.findMany({
      where: { formId: form_id },
      include: {
        responses: {
          include: {
            formField: {
              select: {
                fieldId: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit
    });

    // Format the submissions to match the required response structure
    const formattedSubmissions = submissions.map((submission: any) => {
      // Convert responses array to an object with field_id as keys
      const data = submission.responses.reduce(
        (acc: Record<string, string | number | boolean>, response: any) => {
          const fieldId = response.formField.fieldId;
          let value: string | number | boolean = response.value;
          
          // Try to convert the value based on typical conversions
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(Number(value)) && value !== '') value = Number(value);
          
          acc[fieldId] = value;
          return acc;
        }, 
        {} as Record<string, string | number | boolean>
      );

      return {
        submission_id: submission.id,
        submitted_at: submission.submittedAt,
        data
      };
    });

    res.status(200).json({
      status: 'success',
      total_count: totalCount,
      page: page,
      limit: limit,
      submissions: formattedSubmissions
    });
  } catch (error) {
    next(error);
  }
}; 