const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tokenPath = path.join(__dirname, '../cache/token.json');

async function getAmadeusAccessToken() {
  try {
    // 1. Verifica cache
    if (fs.existsSync(tokenPath)) {
      const { token, expiresAt } = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
      if (new Date() < new Date(expiresAt)) {
        return token; // ✅ token válido
      }
    }

    // 2. Solicita novo token à API
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // 3. Salva no cache
    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 1800; // segundos
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    fs.writeFileSync(tokenPath, JSON.stringify({ token, expiresAt }, null, 2), 'utf-8');

    return token;
  } catch (error) {
    console.error('Erro ao obter token da Amadeus:', error.response?.data || error.message);
    throw new Error('Falha ao autenticar com a Amadeus API');
  }
}

async function searchAmadeusFlights(origin, destination, departureDate, maxPrice) {
  const token = await getAmadeusAccessToken();

  try {
    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults: 1,
        maxPrice,
        currencyCode: 'BRL',
        max: 5
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log("🔍 Resultado bruto da API Amadeus:", response.data);
    }

    return {
      data: response.data.data,
      dictionaries: response.data.dictionaries
    }
  } catch (error) {
    console.error('Erro ao buscar voos na Amadeus:', error.response?.data || error.message);
    throw new Error('Falha na consulta de voos na Amadeus');
  }
}

module.exports = {
  getAmadeusAccessToken,
  searchAmadeusFlights,
};
