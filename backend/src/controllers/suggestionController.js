const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getAmadeusAccessToken } = require('../services/apiService');
const { searchAmadeusFlights } = require('../services/flightsService');

async function getSuggestions(req, res) {
  const { origin, departureDate, returnDate, tripType, budget } = req.body;
  console.log("📥 Requisição recebida para sugestão:", req.body);

  try {
    const token = await getAmadeusAccessToken();

    // Carrega e processa o cache autocompleteCities.json
    const autocompleteCities = JSON.parse(fs.readFileSync(path.join(__dirname, '../cache/autocompleteCities.json'), 'utf-8'));
    const iataToCityName = {};
    Object.values(autocompleteCities).flat().forEach(entry => {
      if (!iataToCityName[entry.iataCode]) {
        iataToCityName[entry.iataCode] = entry.name;
      }
    });

    const originName = iataToCityName[origin]?.toUpperCase() || origin;

    // 1. Buscar destinos recomendados com base na origem
    const recoResponse = await axios.get('https://test.api.amadeus.com/v1/reference-data/recommended-locations', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        cityCodes: origin,
      },
    });

    const recommendedCities = recoResponse.data?.data || [];
    console.log("📍 Cidades sugeridas:", recommendedCities.map(c => `${c.name} (${c.iataCode})`));

    const results = [];
    const dictionaries = { carriers: {} };

    // 2. Para cada cidade recomendada, buscar voos
    for (const city of recommendedCities) {
      console.log(`🔁 Buscando voos de ${originName} (${origin}) para ${city.name?.toUpperCase()} (${city.iataCode})`);
      console.log(`📅 Data: ${departureDate} | Tipo: ${tripType} | Budget: R$${budget}`);

      try {
        const res = await searchAmadeusFlights(
          origin,
          city.iataCode,
          departureDate,
          returnDate,
          tripType,
          budget
        );

        if (res?.data?.length) {
          console.log(`✅ ${city.iataCode}: ${res.data.length} voos encontrados dentro do orçamento.`);

          const enriched = res.data.map((offer) => ({
            ...offer,
            origin: origin,
            originName: originName,
            destination: city.iataCode,
            destinationName: iataToCityName[city.iataCode]?.toUpperCase() || city.name?.toUpperCase() || city.iataCode
          }));

          results.push(...enriched);
          Object.assign(dictionaries.carriers, res.dictionaries?.carriers || {});
        } else {
          console.log(`❌ ${city.iataCode}: nenhum voo encontrado ou fora do orçamento.`);
        }

      } catch (err) {
        console.warn(`⚠️ Erro ao buscar ${city.iataCode}:`, err.message);
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
