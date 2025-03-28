import request from 'supertest';
import app from '../index';
import { prisma } from '../services/dbService';

// Mock the Prisma client
jest.mock('../services/dbService', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn()
    },
    $disconnect: jest.fn()
  },
  db: {
    disconnect: jest.fn()
  }
}));

// Sample test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!'
};

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      // Mock the Prisma findFirst to return null (no existing user)
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock the Prisma create to return user data
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '123',
        username: testUser.username,
        email: testUser.email,
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 400 if user already exists', async () => {
      // Mock the Prisma findFirst to return an existing user
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: '123',
        username: testUser.username,
        email: testUser.email
      });

      const response = await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // Mock implementation will be added here
    });

    it('should return 401 with invalid credentials', async () => {
      // Mock implementation will be added here
    });
  });
}); 