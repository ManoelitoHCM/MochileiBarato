class DestinationsController {
  static async searchDestinations(origin, month, budget, destination = null) {
    try {
      const departureDate = generateDepartureDate(month);

      const results = []; // <-- Declare aqui

      if (destination) {
        const flightResults = await searchAmadeusFlights(origin, destination, departureDate, budget);

        console.log("Resultados de voos:", flightResults);

        for (const flight of flightResults) {
          const itinerary = flight.itineraries?.[0];
          const segment = itinerary?.segments?.[0];
          const pricing = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

          if (!itinerary || !segment || !pricing) {
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

        return results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); // <-- importante
      }

      // Caso contrário, comportamento de sugestão
      const validCities = cities.filter(city =>
        city.bestMonths.includes(month) &&
        city.country === "Brasil" &&
        city.iataCode !== origin
      );

      const searchResults = [];

      for (const city of validCities) {
        try {
          const flights = await searchAmadeusFlights(origin, city.iataCode, departureDate, budget);

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
