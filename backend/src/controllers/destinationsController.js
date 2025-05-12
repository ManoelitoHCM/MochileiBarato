// backend/src/controllers/destinations.controller.js
const { mockFlightApi, searchAmadeusFlights } = require('../services/flightsService');
const cities = require('../data/cities.json');

class DestinationsController {
  static async searchDestinations(origin, month, budget) {
    try {
      // Encontra a cidade de origem com base no nome
      const originCity = cities.find(city => city.name.toLowerCase() === origin.toLowerCase());
      if (!originCity) throw new Error(`Cidade de origem não encontrada: ${origin}`);

      const originIata = originCity.iataCode;

      // Define uma data de embarque futura (15 dias a partir de hoje)
      const departureDateObj = new Date();
      departureDateObj.setDate(departureDateObj.getDate() + 15);
      const departureDate = departureDateObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD

      // Filtra destinos válidos no Brasil e no mês selecionado
      const validCities = cities.filter(city =>
        city.bestMonths.includes(month) &&
        city.country === "Brasil" &&
        city.iataCode !== originIata // evita buscar a própria cidade
      );

      const searchResults = [];

      for (const city of validCities) {
        try {
          const flights = await searchAmadeusFlights(originIata, city.iataCode, departureDate, budget);

          if (flights && flights.length > 0) {
            const cheapest = flights[0];

            searchResults.push({
              id: city.id,
              name: city.name,
              attractions: city.attractions,
              price: cheapest.price.total,
              duration: cheapest.itineraries[0].duration,
              iataCode: city.iataCode,
            });
          }
        } catch (err) {
          console.warn(`Erro ao buscar voos para ${city.name}:`, err.message);
          continue;
        }
      }

      return searchResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } catch (error) {
      console.error("Erro ao buscar destinos:", error);
      throw new Error("Falha na busca de destinos");
    }
  }
}

module.exports = DestinationsController;
