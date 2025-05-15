// backend/src/services/flights.service.js
const axios = require('axios');

// Autenticação na API da Amadeus
async function getAmadeusAccessToken() {
  try {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    console.log('Carregando credenciais:');
    console.log('Client ID:', process.env.AMADEUS_CLIENT_ID);
    console.log('Client Secret:', process.env.AMADEUS_CLIENT_SECRET ? '[OK]' : '[MISSING]');

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

    return response.data.access_token;
  } catch (error) {
    console.error('Erro ao obter token da Amadeus:', error.response?.data || error.message);
    throw new Error('Falha ao autenticar com a Amadeus API');
  }
}

// Consulta de voos reais
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

    console.dir(response.data, { depth: null });

    console.log("🔍 Resultado bruto da API Amadeus:");
    console.log(response.data, { depth: null });
    
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar voos na Amadeus:', error.response?.data || error.message);
    throw new Error('Falha na consulta de voos na Amadeus');
  }
}

// Exporta tudo junto
module.exports = {
  getAmadeusAccessToken,
  searchAmadeusFlights,
};
