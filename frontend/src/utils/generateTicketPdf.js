// src/utils/generateTicketPdf.js
import jsPDF from 'jspdf';

export function generateTicketPdf(flight, direction = 'Ida', originLabel, destinationLabel) {
  const doc = new jsPDF();

  const formatDate = (datetime) => datetime?.split('T')[0] || '---';
  const formatTime = (datetime) => datetime?.split('T')[1]?.slice(0, 5) || '--:--';

  const segments = flight.itineraries?.[0]?.segments || [];

  const departureDate = formatDate(flight.departure || segments[0]?.departure?.at);
  const departureTime = formatTime(flight.departure || segments[0]?.departure?.at);
  const arrivalDate = formatDate(flight.arrival || segments.slice(-1)[0]?.arrival?.at);
  const arrivalTime = formatTime(flight.arrival || segments.slice(-1)[0]?.arrival?.at);

  const origin = originLabel || segments[0]?.departure?.iataCode || flight.origin || '---';
  const destination = destinationLabel || segments.slice(-1)[0]?.arrival?.iataCode || flight.destination || '---';

  const flightNumber = flight.flightNumber || segments[0]?.number || '---';
  const aircraft = flight.aircraft || segments[0]?.aircraft?.code || '---';
  const cabin = flight.cabin || flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || '---';

  const airline = flight.airline || segments[0]?.carrierCode || 'Companhia';
  const price = flight.price?.total || flight.price || '---';
  const duration = flight.duration || flight.itineraries?.[0]?.duration || '---';
  const stops = typeof flight.stops === 'number'
    ? flight.stops
    : (segments.length || 1) - 1;
  const baggage = flight.baggageInfo || 'Sem informação';

  doc.setFontSize(16);
  doc.text('Mochilei Barato - Bilhete de Voo', 20, 20);

  doc.setFontSize(12);
  doc.text(`Tipo: ${direction}`, 20, 30);
  doc.text(`De: ${origin}`, 20, 38);
  doc.text(`Para: ${destination}`, 20, 46);
  doc.text(`Companhia Aérea: ${airline}`, 20, 56);
  doc.text(`Número do Voo: ${flightNumber}`, 20, 64);
  doc.text(`Aeronave: ${aircraft}`, 20, 72);
  doc.text(`Cabine: ${cabin}`, 20, 80);

  doc.text(`Partida: ${departureDate} às ${departureTime}`, 20, 92);
  doc.text(`Chegada: ${arrivalDate} às ${arrivalTime}`, 20, 100);

  doc.text(`Duração: ${duration}`, 20, 112);
  doc.text(`Paradas: ${stops === 0 ? 'Voo direto' : `${stops} escala(s)`}`, 20, 120);
  doc.text(`Preço: R$ ${price}`, 20, 128);
  doc.text(`Bagagem: ${baggage}`, 20, 136);

  doc.save(`Bilhete_${direction}_${flightNumber}.pdf`);
}
