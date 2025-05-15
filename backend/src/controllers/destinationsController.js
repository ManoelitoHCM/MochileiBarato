const { searchAmadeusFlights } = require('../services/flightsService');
const cities = require('../data/cities.json');

function generateDepartureDateFromInput(dateStr) {
  const inputDate = new Date(dateStr);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 360);

  return inputDate > maxDate ? maxDate.toISOString().split('T')[0] : dateStr;
}

class DestinationsController {
  static async searchDestinations(origin, departureDate, budget, destination = null, returnDate = null, tripType = 'one-way') {
    try {
      const formattedDeparture = generateDepartureDateFromInput(departureDate);
      const formattedReturn = returnDate ? generateDepartureDateFromInput(returnDate) : null;
      const results = [];

      if (destination) {
        const flightResults = await searchAmadeusFlights(origin, destination, formattedDeparture, budget, formattedReturn);

        console.log("🔍 Resultado bruto da API Amadeus:");
        console.dir(flightResults, { depth: null });

        for (const flight of flightResults) {
          const itinerary = Array.isArray(flight.itineraries) ? flight.itineraries[0] : null;
          const segment = itinerary && Array.isArray(itinerary.segments) ? itinerary.segments[0] : null;
          const pricing = Array.isArray(flight.travelerPricings)
            ? flight.travelerPricings[0]?.fareDetailsBySegment?.[0]
            : null;

          if (!itinerary || !segment || !pricing) {
            console.warn("Dados incompletos no voo:", flight);
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
            flightNumber: segment.number
          });
        }

        return results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      }

      const validCities = cities.filter(city =>
        city.country === "Brasil" &&
        city.iataCode !== origin
      );

      const searchResults = [];

      for (const city of validCities) {
        try {
          const flights = await searchAmadeusFlights(origin, city.iataCode, formattedDeparture, budget);

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
