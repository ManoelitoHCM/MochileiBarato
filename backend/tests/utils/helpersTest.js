// tests/utils/helpers.test.js
const fs = require('fs');
const path = require('path');
const mockFs = require('mock-fs');

const flightCachePath = path.join(__dirname, '../../src/cache/flights.json');

describe('Helpers e cache', () => {
  beforeEach(() => {
    mockFs({
      [flightCachePath]: JSON.stringify({ 'gru-gig-2025-12-25': { dummy: 'data' } })
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('deve carregar cache de voos corretamente', () => {
    const cache = JSON.parse(fs.readFileSync(flightCachePath, 'utf-8'));
    expect(cache['gru-gig-2025-12-25'].dummy).toBe('data');
  });
});
