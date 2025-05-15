const { searchAmadeusFlights } = require('../services/flightsService');
const cities = require('../data/cities.json'); // importante: não esqueça essa linha!

// Gera uma data válida com base no mês informado e limita a 360 dias no futuro
function generateDepartureDate(monthYear) {
  const [year, month] = monthYear.split('-').map(Number);
  const date = new Date(year, month - 1, 10); // dia fixo 10

  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(now.getDate() + 360);

  if (date > maxDate) {
    console.warn('⚠️ Data muito no futuro. Ajustando para data máxima permitida.');
    return maxDate.toISOString().split('T')[0];
  }

  return date.toISOString().split('T')[0];
}

class DestinationsController {
  static async searchDestinations(origin, month, budget, destination = null) {
    try {
      const departureDate = generateDepartureDate(month);
      const results = [];

      // Caso: destino direto
      if (destination) {
        const flightResults = await searchAmadeusFlights(origin, destination, departureDate, budget);

        console.log("🔍 Resultado bruto da API Amadeus:");
        console.dir(flightResults, { depth: null });

        for (const flight of flightResults) {
          const itinerary = Array.isArray(flight.itineraries) ? flight.itineraries[0] : null;
          const segment = itinerary?.segments?.[0];
          const pricing = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

          if (!itinerary || !segment || !pricing) {
            console.warn("❌ Dados incompletos no voo:", flight);
            continue;
          }

          results.push({
            price: flight.price.total,
            duration: itinerary.duration,
            departure: segment.departure.at,
            arrival: segment.arrival.at,
            stops: itinerary.segments.length - 1,
            airline: segment.carrierCode,
            cabin: pricing.cabin,
            aircraft: segment.aircraft?.code,
            flightNumber: segment.number,
            origin,
            destination
          });
        }

        return results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      }

      // Caso: sugestão de destinos
      const validCities = cities.filter(city =>
        city.bestMonths.includes(month) &&
        city.country === "Brasil" &&
        city.iataCode !== origin
      );

      const searchResults = [];

      for (const city of validCities) {
        try {
          const flights = await searchAmadeusFlights(origin, city.iataCode, departureDate, budget);

          if (flights?.length > 0) {
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
