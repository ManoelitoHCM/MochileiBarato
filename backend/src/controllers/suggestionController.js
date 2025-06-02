const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getAmadeusAccessToken } = require('../services/apiService');
const DestinationsController = require('./destinationsController');

async function getSuggestions(req, res) {
  const { origin, departureDate, returnDate, tripType, budget } = req.body;
  console.log("📥 Requisição recebida para sugestão:", req.body);

  try {
    const token = await getAmadeusAccessToken();

    const autocompleteCities = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../cache/autocompleteCities.json'), 'utf-8')
    );

    const iataToCityName = {};
    Object.values(autocompleteCities).flat().forEach(entry => {
      if (!iataToCityName[entry.iataCode]) {
        iataToCityName[entry.iataCode] = entry.name;
      }
    });

    // Normaliza o código da cidade de origem
    const cityEntry = Object.values(autocompleteCities).flat().find(entry => entry.iataCode === origin);
    const normalizedOrigin = cityEntry?.cityCode || origin;
    const originName = iataToCityName[normalizedOrigin]?.toUpperCase() || normalizedOrigin;

    // Consulta sugestões de destinos da Amadeus
    const recoResponse = await axios.get('https://test.api.amadeus.com/v1/reference-data/recommended-locations', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        cityCodes: normalizedOrigin,
        destinationCountryCodes: 'BR',
      },
    });

    const recommendedCities = recoResponse.data?.data || [];
    console.log("📍 Cidades sugeridas pela Amadeus:", recommendedCities.map(c => `${c.name} (${c.iataCode})`));

    const results = [];
    const dictionaries = {
      carriers: {},
      locations: {},
      aircraft: {},
    };

    for (const city of recommendedCities) {
      const cityCode = city.iataCode;
      const cityName = city.name?.toUpperCase() || cityCode;

      console.log(`🔁 Buscando voos via controller de ${originName} (${normalizedOrigin}) para ${cityName} (${cityCode})`);

      try {
        // Consulta a lógica tradicional de voos
        let result = await DestinationsController.searchDestinations(
          normalizedOrigin,
          departureDate,
          budget,
          cityCode,
          returnDate,
          tripType
        );

        // Adiciona informações de origem e destino visível
        const enrich = (arr) =>
          arr.map((f) => ({
            ...f,
            originName: originName,
            destinationName: cityName
          }));

        if (result?.outbound?.length) {
          result.outbound = enrich(result.outbound);
          results.push(...result.outbound);
        } else if (Array.isArray(result) && result.length > 0) {
          results.push(...enrich(result));
        } else {
          console.log(`❌ Nenhum voo encontrado para ${cityCode}`);
        }
      } catch (err) {
        console.warn(`⚠️ Erro ao buscar destino ${cityCode}:`, err.message);
      }
    }

    res.json({
      data: results,
      dictionaries
    });

  } catch (err) {
    console.error('❌ Erro ao gerar sugestões:', err.message);
    res.status(500).json({ error: 'Erro ao gerar sugestões de destinos.' });
  }
}

module.exports = { getSuggestions };
