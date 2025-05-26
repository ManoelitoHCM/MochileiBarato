// src/utils/generateTicketPdf.js
import jsPDF from 'jspdf';

export function generateTicketPdf(flight, direction = 'Ida') {
  const doc = new jsPDF();

  const formatDate = (datetime) => datetime?.split('T')[0] || '---';
  const formatTime = (datetime) => datetime?.split('T')[1]?.slice(0, 5) || '--:--';

  const departureDate = formatDate(flight.departure);
  const departureTime = formatTime(flight.departure);
  const arrivalDate = formatDate(flight.arrival);
  const arrivalTime = formatTime(flight.arrival);

  const origin = flight.origin || flight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || '---';
  const destination = flight.destination || flight.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode || '---';

  const flightNumber = flight.flightNumber || flight.itineraries?.[0]?.segments?.[0]?.number || '---';
  const aircraft = flight.aircraft || flight.itineraries?.[0]?.segments?.[0]?.aircraft?.code || '---';
  const cabin = flight.cabin || flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || '---';

  const airline = flight.airline || flight.itineraries?.[0]?.segments?.[0]?.carrierCode || 'Companhia';
  const price = flight.price?.total || flight.price || '---';
  const duration = flight.duration || flight.itineraries?.[0]?.duration || '---';
  const stops = typeof flight.stops === 'number' ? flight.stops : (flight.itineraries?.[0]?.segments?.length || 1) - 1;
  const baggage = flight.baggageInfo || 'N/A';

  doc.setFontSize(16);
  doc.text('Mochilei Barato - Bilhete de Voo', 20, 20);

  doc.setFontSize(12);
  doc.text(`Tipo: ${direction}`, 20, 35);
  doc.text(`Companhia Aérea: ${airline}`, 20, 45);
  doc.text(`Número do Voo: ${flightNumber}`, 20, 55);
  doc.text(`Aeronave: ${aircraft}`, 20, 65);
  doc.text(`Cabine: ${cabin}`, 20, 75);

  doc.text(`Origem: ${origin}`, 20, 90);
  doc.text(`Destino: ${destination}`, 20, 100);
  doc.text(`Partida: ${departureDate} às ${departureTime}`, 20, 110);
  doc.text(`Chegada: ${arrivalDate} às ${arrivalTime}`, 20, 120);

  doc.text(`Duração: ${duration}`, 20, 135);
  doc.text(`Paradas: ${stops === 0 ? 'Voo direto' : `${stops} escala(s)`}`, 20, 145);
  doc.text(`Preço: R$ ${price}`, 20, 155);
  doc.text(`Bagagem: ${baggage}`, 20, 165);

  doc.save(`Bilhete_${direction}_${flightNumber}.pdf`);
}
