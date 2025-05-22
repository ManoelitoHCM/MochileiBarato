// tests/routes/cityRoutes.test.js
const request = require('supertest');
const express = require('express');
const app = express();
const cityRoutes = require('../../src/routes/cityRoutes');

jest.mock('../../src/services/apiService', () => ({
  getAmadeusAccessToken: jest.fn().mockResolvedValue('fake_token')
}));

const axios = require('axios');
jest.mock('axios');

app.use('/api/cities', cityRoutes);

describe('Rota de autocomplete de cidades', () => {
  it('deve retornar sugestões de cidades', async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [
          { name: 'São Paulo', iataCode: 'SAO' },
          { name: 'Rio de Janeiro', iataCode: 'RIO' }
        ]
      }
    });

    const res = await request(app).get('/api/cities/search?q=Rio');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ iataCode: 'RIO' })
    ]));
  });
});
