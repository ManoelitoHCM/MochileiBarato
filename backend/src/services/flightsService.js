const axios = require('axios');
const { getAmadeusAccessToken } = require('./apiService');

async function searchAmadeusFlights(origin, destination, departureDate, maxPrice) {
  const token = await getAmadeusAccessToken();

  try {
    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults: 1,
        maxPrice,
        currencyCode: 'BRL',
        max: maxResults
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log("🔍 Resultado bruto da API Amadeus:", response.data);
    }

    return {
      data: response.data.data,
      dictionaries: response.data.dictionaries
    };
  } catch (error) {
    console.error('Erro ao buscar voos na Amadeus:', error.response?.data || error.message);
    throw new Error('Falha na consulta de voos na Amadeus');
  }
}

async function getCheapestDates(origin, destination) {
  const token = await getAmadeusAccessToken();

  const response = await axios.get('https://test.api.amadeus.com/v1/shopping/flight-dates', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      origin,
      destination,
      currencyCode: 'BRL',
      adults: 1,
    },
  });

  return response.data.data;
}

module.exports = {
  searchAmadeusFlights,
  getCheapestDates,
};