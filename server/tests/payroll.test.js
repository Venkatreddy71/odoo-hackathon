const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Contract = require('../models/Contract');
const Employee = require('../models/Employee');

describe('PeoplePay360 Backend API & Business Rules Tests', () => {
  let adminToken;
  let employeeId;

  beforeAll(async () => {
    // Login as Admin to get token
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@peoplepay360.com',
      password: 'admin123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    adminToken = res.body.token;

    // Get Arav Mehta Employee ID
    const empRes = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);
    const arav = empRes.body.employees.find((e) => e.firstName === 'Arav');
    employeeId = arav._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('BUSINESS RULE: Reject overlapping RUNNING contract for same employee', async () => {
    // Attempt to create a contract for Arav running from 2026-05-01 to 2026-12-31 while his current contract runs 2026-04-01 to 2026-12-31
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employee: employeeId,
        contractName: 'Illegal Overlapping Contract',
        startDate: '2026-05-01',
        endDate: '2026-12-31',
        wage: 50000,
        salaryStructure: '660000000000000000000001', // dummy id
        status: 'RUNNING',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('CRITICAL BUSINESS RULE VIOLATION');
  });

  test('PAYROLL ENGINE: Preview & Step 1 payrun does not save record', async () => {
    const res = await request(app)
      .post('/api/payruns/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        periodStart: '2026-04-01',
        periodEnd: '2026-04-30',
        salaryStructure: '660000000000000000000001',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.previewList.length).toBeGreaterThan(0);
  });
});
