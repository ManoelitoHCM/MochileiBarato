const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getAmadeusAccessToken } = require('../services/flightsService');

router.get('/search', async (req, res) => {
  const keyword = String(req.query.q || '').trim();

  if (!keyword || keyword.length < 2) {
    return res.status(400).json({ error: 'Informe pelo menos 2 letras.' });
  }

  try {
    const token = await getAmadeusAccessToken();

    const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/cities', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        keyword: keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, ''),
        countryCode: 'BR',
        max: 5
      }
    });

    const cities = response.data.data
      .filter(loc => loc.iataCode)
      .map(loc => ({
        name: loc.name,
        iataCode: loc.iataCode
      }));

    res.json(cities);
  } catch (error) {
    console.error('Erro ao buscar cidades:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar cidades.' });
  }
});

module.exports = router;
