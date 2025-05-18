const { searchAmadeusFlights } = require('../services/flightsService');
const cities = require('../data/cities.generated.json');
const fs = require('fs');
const path = require('path');

const flightCachePath = path.join(__dirname, '../cache/flights.json');
let flightCache = {};
try {
  if (fs.existsSync(flightCachePath)) {
    flightCache = JSON.parse(fs.readFileSync(flightCachePath, 'utf-8'));
  }
} catch (err) {
  console.warn('⚠️ Erro ao carregar cache de voos:', err.message);
}

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
        const cacheKey = `${origin}-${destination}-${formattedDeparture}-${budget}-${formattedReturn || 'no-return'}-${tripType}`.toLowerCase();

        if (flightCache[cacheKey]) {
          console.log(`📦 Cache HIT para ${cacheKey}`);
          return flightCache[cacheKey];
        }

        // 🛫 Voos de ida
        const { data: outboundFlights, dictionaries } = await searchAmadeusFlights(origin, destination, formattedDeparture, budget, maxResults);
        const carriers = dictionaries?.carriers || {};

        const outboundResults = outboundFlights.map(flight => {
          const itinerary = flight.itineraries?.[0];
          const segment = itinerary?.segments?.[0];
          const pricing = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

          if (segment && pricing) {
            const airlineName = carriers[segment.carrierCode] || segment.carrierCode;

            return {
              price: flight.price.total,
              duration: itinerary.duration,
              departure: segment.departure.at,
              arrival: segment.arrival.at,
              stops: itinerary.segments.length - 1,
              airline: airlineName,
              cabin: pricing.cabin,
              aircraft: segment.aircraft?.code,
              flightNumber: segment.number
            };
          }
        }).filter(Boolean);

        // 🛬 Voos de volta (se aplicável)
        const inboundResults = [];

        if (tripType === 'round-trip' && formattedReturn) {
          try {
            const { data: returnFlights, dictionaries: returnDictionaries } = await searchAmadeusFlights(destination, origin, formattedReturn, budget);
            const returnCarriers = returnDictionaries?.carriers || {};

            for (const flight of returnFlights) {
              const itinerary = flight.itineraries?.[0];
              const segment = itinerary?.segments?.[0];
              const pricing = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

              if (segment && pricing) {
                const airlineName = returnCarriers[segment.carrierCode] || segment.carrierCode;

                inboundResults.push({
                  price: flight.price.total,
                  duration: itinerary.duration,
                  departure: segment.departure.at,
                  arrival: segment.arrival.at,
                  stops: itinerary.segments.length - 1,
                  airline: airlineName,
                  cabin: pricing.cabin,
                  aircraft: segment.aircraft?.code,
                  flightNumber: segment.number
                });
              }
            }
          } catch (err) {
            console.warn('❌ Erro ao buscar voos de volta:', err.message || err);
          }
        }

        const result = {
          outbound: removeDuplicateFlights(outboundResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))),
          inbound: removeDuplicateFlights(inboundResults.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)))
        };

        // Salva no cache
        flightCache[cacheKey] = result;
        fs.writeFile(flightCachePath, JSON.stringify(flightCache, null, 2), () => {
          console.log(`💾 Cache salvo para ${cacheKey}`);
        });

        return result;
      }

      // 🌎 Sugestão de destinos (sem cache por enquanto)
      const validCities = cities.filter(city =>
        city.country === "Brasil" && city.iataCode && city.iataCode !== origin
      );

      const searchResults = [];

      for (const city of validCities) {
        try {
          const { data: flights } = await searchAmadeusFlights(origin, city.iataCode, formattedDeparture, budget);
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
