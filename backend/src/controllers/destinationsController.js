const { searchAmadeusFlights } = require('../services/flightsService');
const cities = require('../data/cities.generated.json');

function generateDepartureDateFromInput(dateStr) {
  const inputDate = new Date(dateStr);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 360);

  return inputDate > maxDate ? maxDate.toISOString().split('T')[0] : dateStr;
}

function removeDuplicateFlights(flights) {
  const seen = new Set();
  return flights.filter(flight => {
    const key = `${flight.departure}-${flight.arrival}-${flight.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

class DestinationsController {
  static async searchDestinations(origin, departureDate, budget, destination = null, returnDate = null, tripType = 'one-way') {
    try {
      const formattedDeparture = generateDepartureDateFromInput(departureDate);
      const formattedReturn = returnDate ? generateDepartureDateFromInput(returnDate) : null;

      if (destination) {
        const outboundFlights = await searchAmadeusFlights(origin, destination, formattedDeparture, budget);
        const outboundResults = outboundFlights.map(flight => {
          const itinerary = flight.itineraries?.[0];
          const segment = itinerary?.segments?.[0];
          const pricing = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

          if (segment && pricing) {
            return {
              price: flight.price.total,
              duration: itinerary.duration,
              departure: segment.departure.at,
              arrival: segment.arrival.at,
              stops: itinerary.segments.length - 1,
              airline: segment.carrierCode,
              cabin: pricing.cabin,
              aircraft: segment.aircraft?.code,
              flightNumber: segment.number
            };
          }
        }).filter(Boolean);

        const inboundResults = [];
        if (tripType === 'round-trip' && formattedReturn) {
          try {
            const returnFlights = await searchAmadeusFlights(destination, origin, formattedReturn, budget);
            returnFlights.forEach(flight => {
              const itinerary = flight.itineraries?.[0];
              const segment = itinerary?.segments?.[0];
              const pricing = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

              if (segment && pricing) {
                inboundResults.push({
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
            });
          } catch (err) {
            console.warn('❌ Erro ao buscar voos de volta:', err.message || err);
          }
        }

        return {
          outbound: removeDuplicateFlights(
            outboundResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
          ),
          inbound: removeDuplicateFlights(
            inboundResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
          )
        };
      }

      const validCities = cities.filter(city => city.country === "Brasil" && city.iataCode && city.iataCode !== origin);

      const searchResults = [];
      for (const city of validCities) {
        try {
          const flights = await searchAmadeusFlights(origin, city.iataCode, formattedDeparture, budget);
          if (flights && flights.length > 0) {
            const cheapest = flights[0];
            searchResults.push({
              name: city.name,
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