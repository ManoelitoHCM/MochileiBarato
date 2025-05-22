// tests/routes/destinationsRoutes.test.js
const request = require('supertest');
const express = require('express');
const destinationsRoutes = require('../../src/routes/destinationsRoutes');
const app = express();

app.use(express.json());
app.use('/api/destinations', destinationsRoutes);

jest.mock('../../src/controllers/destinationsController', () => ({
  searchDestinations: jest.fn().mockResolvedValue({
    outbound: [{ price: '199.99', airline: 'Alitalia' }],
    inbound: []
  })
}));

describe('Rotas de destinos', () => {
  it('deve retornar resultados de busca simulados', async () => {
    const res = await request(app).post('/api/destinations').send({
      origin: 'GRU',
      destination: 'GIG',
      departureDate: '2025-12-25',
      tripType: 'one-way',
      budget: 1000
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.outbound).toHaveLength(1);
    expect(res.body.outbound[0].airline).toBe('Alitalia');
  });
});
