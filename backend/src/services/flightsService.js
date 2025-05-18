const axios = require('axios');

async function getAmadeusAccessToken() {
  try {
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

    return response.data.access_token;
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

    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar voos na Amadeus:', error.response?.data || error.message);
    throw new Error('Falha na consulta de voos na Amadeus');
  }
}

module.exports = {
  getAmadeusAccessToken,
  searchAmadeusFlights,
};
