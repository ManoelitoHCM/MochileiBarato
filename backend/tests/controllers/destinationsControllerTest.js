// tests/controllers/destinationsController.test.js
const DestinationsController = require('../../src/controllers/destinationsController');
const { getAmadeusAccessToken } = require('../../src/services/apiService');
const nock = require('nock');

jest.mock('../../src/services/apiService');

const fakeToken = 'fake_token';

describe('DestinationsController', () => {
  beforeEach(() => {
    getAmadeusAccessToken.mockResolvedValue(fakeToken);
  });

  it('deve buscar destinos com sucesso', async () => {
    nock('https://test.api.amadeus.com')
      .get('/v2/shopping/flight-offers')
      .query(true)
      .reply(200, {
        data: [
          {
            itineraries: [{ duration: 'PT1H', segments: [{ departure: { at: '2025-12-25T10:00' }, arrival: { at: '2025-12-25T11:00' }, carrierCode: 'AZ', aircraft: { code: '320' }, number: 'AZ123' }] }],
            price: { total: '300' },
            travelerPricings: [{ fareDetailsBySegment: [{ cabin: 'ECONOMY' }] }]
          }
        ],
        dictionaries: { carriers: { AZ: 'Alitalia' } }
      });

    const result = await DestinationsController.searchDestinations('GRU', '2025-12-25', 3000, 'GIG', null, 'one-way');
    expect(result.outbound).toHaveLength(1);
    expect(result.outbound[0].airline).toBe('Alitalia');
  });
});
