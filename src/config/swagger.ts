import { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../package.json';

// Swagger definition
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kraft Forms API Documentation',
      version,
      description: 'API documentation for Kraft Forms - a dynamic form builder and submission service',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@kraftforms.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.kraftforms.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}'
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication operations',
      },
      {
        name: 'Forms',
        description: 'Form management operations',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/validations/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default function setupSwagger(app: Express): void {
  // Swagger UI endpoint
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Kraft Forms API Documentation',
  }));

  // Endpoint to get swagger.json
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger docs available at /api-docs');
} 