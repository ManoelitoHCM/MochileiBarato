// tests/services/flightsService.test.js
const nock = require('nock');
const fs = require('fs');
const path = require('path');
const mockFs = require('mock-fs');
const { searchAmadeusFlights } = require('../../src/services/flightsService');
const { getAmadeusAccessToken } = require('../../src/services/apiService');

jest.mock('../../src/services/apiService');

const fakeToken = 'fake_token';

describe('flightsService', () => {
  beforeEach(() => {
    getAmadeusAccessToken.mockResolvedValue(fakeToken);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('deve retornar resultados simulados da API Amadeus', async () => {
    nock('https://test.api.amadeus.com')
      .get('/v2/shopping/flight-offers')
      .query(true)
      .reply(200, {
        data: [{ id: '1', price: { total: '200' } }],
        dictionaries: { carriers: { AZ: 'Alitalia' } }
      });

    const result = await searchAmadeusFlights('GRU', 'GIG', '2025-12-25', 2500);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].price.total).toBe('200');
    expect(result.dictionaries.carriers.AZ).toBe('Alitalia');
  });
});