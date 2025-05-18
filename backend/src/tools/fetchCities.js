require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://test.api.amadeus.com';

async function getAccessToken() {
  const res = await axios.post(
    `${BASE_URL}/v1/security/oauth2/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return res.data.access_token;
}

async function fetchCitiesByKeyword(keyword, token) {
  const response = await axios.get(`${BASE_URL}/v1/reference-data/locations/cities`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      keyword: keyword.normalize("NFD").replace(/[̀-ͯ]/g, ""),
      countryCode: 'BR',
      max: 10,
    },
  });

  return response.data.data
    .filter(loc => loc.iataCode) // filtra apenas cidades com código IATA
    .map(loc => ({
      name: loc.name,
      iataCode: loc.iataCode,
      country: 'Brasil',
    }));
}

async function fetchMultipleCities() {
  const keywords = ['Rio', 'São', 'Salvador', 'Fortaleza', 'Recife', 'Belo', 'Manaus', 'Natal', 'Foz', 'Porto', 'Maceió'];
  const token = await getAccessToken();
  const allCities = new Map();

  for (const kw of keywords) {
    const safeKeyword = encodeURIComponent(kw);
    try {
      const results = await fetchCitiesByKeyword(safeKeyword, token);
      for (const city of results) {
        allCities.set(city.iataCode, city); // Evita duplicatas
      }
    } catch (err) {
      console.error(`Erro ao buscar por "${kw}":`, err.response?.data || err.message);
    }
  }

  const uniqueCities = Array.from(allCities.values());

  fs.writeFileSync('src/data/cities.generated.json', JSON.stringify(uniqueCities, null, 2), 'utf-8');
  console.log(`Arquivo gerado com ${uniqueCities.length} cidades.`);
}

fetchMultipleCities();
