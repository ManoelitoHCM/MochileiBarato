const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getAmadeusAccessToken } = require('../services/apiService');

const cachePath = path.join(__dirname, '../cache/autocompleteCities.json');

// Carrega cache existente (ou inicia vazio)
let cache = {};
try {
  if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
} catch (err) {
  console.error('Erro ao ler cache local:', err);
  cache = {};
}

router.get('/search', async (req, res) => {
  const keyword = String(req.query.q || '').trim().toLowerCase();

  if (!keyword || keyword.length < 2) {
    return res.status(400).json({ error: 'Informe pelo menos 2 letras.' });
  }

  if (cache[keyword]) {
    return res.json(cache[keyword]);
  }

  try {
    const token = await getAmadeusAccessToken();

    const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/cities', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        keyword: keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, ''),
        countryCode: 'BR',
        max: 10
      }
    });

    const cities = response.data.data
      .filter(loc => loc.iataCode)
      .map(loc => ({
        name: loc.name,
        iataCode: loc.iataCode
      }));

    // Salva no cache em memória
    cache[keyword] = cities;

    // Atualiza o arquivo
    fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8', (err) => {
      if (err) console.error('Erro ao salvar cache:', err);
    });

    res.json(cities);
  } catch (error) {
    console.error('Erro ao buscar cidades:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar cidades.' });
  }
});

module.exports = router;
