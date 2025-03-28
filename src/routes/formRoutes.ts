import { Router } from 'express';
import { 
  createForm, 
  deleteForm, 
  getAllForms, 
  getFormById, 
  submitForm, 
  getFormSubmissions 
} from '../controllers/formController';
import { validateRequest } from '../middlewares/validationMiddleware';
import { createFormSchema, submitFormSchema, paginationSchema } from '../validations/formValidation';
import { authenticate, checkFormOwnership } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Forms
 *   description: Form management operations
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     FormField:
 *       type: object
 *       required:
 *         - field_id
 *         - type
 *         - label
 *       properties:
 *         field_id:
 *           type: string
 *           description: Unique identifier for the field within the form
 *         type:
 *           type: string
 *           enum: [string, number, boolean]
 *           description: Data type of the field
 *         label:
 *           type: string
 *           description: Display label for the field
 *         required:
 *           type: boolean
 *           default: false
 *           description: Whether the field is required
 *     Form:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated UUID of the form
 *         title:
 *           type: string
 *           description: The form title
 *         description:
 *           type: string
 *           description: Optional form description
 *         userId:
 *           type: string
 *           description: ID of the user who created the form
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the form was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the form was last updated
 *         fields:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FormField'
 *     FormResponse:
 *       type: object
 *       required:
 *         - field_id
 *         - value
 *       properties:
 *         field_id:
 *           type: string
 *           description: The field ID to respond to
 *         value:
 *           oneOf:
 *             - type: string
 *             - type: number
 *             - type: boolean
 *           description: The response value
 *     CreateFormRequest:
 *       type: object
 *       required:
 *         - title
 *         - fields
 *       properties:
 *         title:
 *           type: string
 *           description: The form title
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Optional form description
 *           maxLength: 500
 *         fields:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/FormField'
 *     SubmitFormRequest:
 *       type: object
 *       required:
 *         - responses
 *       properties:
 *         responses:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/FormResponse'
 *     Submission:
 *       type: object
 *       properties:
 *         submission_id:
 *           type: string
 *           description: Unique ID of the submission
 *         submitted_at:
 *           type: string
 *           format: date-time
 *           description: When the form was submitted
 *         data:
 *           type: object
 *           additionalProperties: true
 *           description: Key-value pairs of field_id to response value
 *     SubmissionsResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *         total_count:
 *           type: integer
 *           description: Total number of submissions
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *         submissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Submission'
 */

/**
 * @openapi
 * /forms/create:
 *   post:
 *     tags: [Forms]
 *     summary: Create a new form
 *     description: Creates a new form with specified fields
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFormRequest'
 *     responses:
 *       201:
 *         description: Form created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 message:
 *                   type: string
 *                   example: Form created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Form'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/create', authenticate, validateRequest(createFormSchema), createForm);

/**
 * @openapi
 * /forms/delete/{form_id}:
 *   delete:
 *     tags: [Forms]
 *     summary: Delete a form
 *     description: Deletes a form owned by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: form_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The form ID to delete
 *     responses:
 *       200:
 *         description: Form deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 message:
 *                   type: string
 *                   example: Form deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the form owner
 *       404:
 *         description: Form not found
 */
router.delete('/delete/:form_id', authenticate, checkFormOwnership, deleteForm);

/**
 * @openapi
 * /forms/:
 *   get:
 *     tags: [Forms]
 *     summary: Get all forms
 *     description: Retrieves all forms created by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of forms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Form'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllForms);

/**
 * @openapi
 * /forms/submissions/{form_id}:
 *   get:
 *     tags: [Forms]
 *     summary: Get form submissions
 *     description: Retrieves paginated submissions for a specific form
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: form_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The form ID to get submissions for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of submissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmissionsResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the form owner
 *       404:
 *         description: Form not found
 */
router.get('/submissions/:form_id', authenticate, checkFormOwnership, validateRequest(paginationSchema, 'query'), getFormSubmissions);

/**
 * @openapi
 * /forms/{form_id}:
 *   get:
 *     tags: [Forms]
 *     summary: Get a single form
 *     description: Retrieves a form by ID (public endpoint)
 *     parameters:
 *       - in: path
 *         name: form_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The form ID to retrieve
 *     responses:
 *       200:
 *         description: Form details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   $ref: '#/components/schemas/Form'
 *       404:
 *         description: Form not found
 */
router.get('/:form_id', getFormById);

/**
 * @openapi
 * /forms/submit/{form_id}:
 *   post:
 *     tags: [Forms]
 *     summary: Submit a form
 *     description: Submits responses to a form (public endpoint)
 *     parameters:
 *       - in: path
 *         name: form_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The form ID to submit to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitFormRequest'
 *     responses:
 *       201:
 *         description: Form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 message:
 *                   type: string
 *                   example: Form submitted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     submission_id:
 *                       type: string
 *       400:
 *         description: Validation error or missing required fields
 *       404:
 *         description: Form not found
 */
router.post('/submit/:form_id', validateRequest(submitFormSchema), submitForm);

export default router; 