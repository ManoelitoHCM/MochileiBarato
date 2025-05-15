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

      if (destination) {
        const flightResults = await searchAmadeusFlights(origin, destination, formattedDeparture, budget, formattedReturn);

        console.log("🔍 Resultado bruto da API Amadeus:");
        console.dir(flightResults, { depth: null });

        const outboundResults = [];
        const inboundResults = [];

        for (const flight of flightResults) {
          if (!Array.isArray(flight.itineraries) || flight.itineraries.length === 0) {
            console.warn("Voo sem itinerários:", flight);
            continue;
          }

          const pricing = Array.isArray(flight.travelerPricings)
            ? flight.travelerPricings[0]?.fareDetailsBySegment?.[0]
            : null;

          const itineraryOut = flight.itineraries[0];
          const segmentOut = itineraryOut?.segments?.[0];

          if (segmentOut && pricing) {
            outboundResults.push({
              price: flight.price.total,
              duration: itineraryOut.duration,
              departure: segmentOut.departure.at,
              arrival: segmentOut.arrival.at,
              stops: itineraryOut.segments.length - 1,
              airline: segmentOut.carrierCode,
              cabin: pricing.cabin,
              aircraft: segmentOut.aircraft?.code,
              flightNumber: segmentOut.number
            });
          }

          if (tripType === 'round-trip' && flight.itineraries.length > 1) {
            const itineraryIn = flight.itineraries[1];
            const segmentIn = itineraryIn?.segments?.[0];

            if (segmentIn) {
              inboundResults.push({
                price: flight.price.total,
                duration: itineraryIn.duration,
                departure: segmentIn.departure.at,
                arrival: segmentIn.arrival.at,
                stops: itineraryIn.segments.length - 1,
                airline: segmentIn.carrierCode,
                cabin: pricing?.cabin,
                aircraft: segmentIn.aircraft?.code,
                flightNumber: segmentIn.number
              });
            }
          }
        }

        return {
          outbound: outboundResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)),
          inbound: inboundResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        };
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
