import jsPDF from 'jspdf';

export function generateCombinedTicketPdf(outbound, inbound) {
  console.log("🧾 PDF - Outbound:", outbound);
  console.log("🧾 PDF - Inbound:", inbound);
  
  const doc = new jsPDF();

  const format = (datetimeRaw) => {
    const datetime = String(datetimeRaw || '');
    const [date, time] = datetime.split('T');
    return {
      date: date || '---',
      time: time?.slice(0, 5) || '--:--'
    };
  };

  const addSection = (flight, title, yStart) => {
    const { date: depDate, time: depTime } = format(flight.departure || flight.itineraries?.[0]?.segments?.[0]?.departure?.at);
    const { date: arrDate, time: arrTime } = format(flight.arrival || flight.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.at);

    // ✅ Resolução robusta de origem/destino
    let origin = flight.origin;
    let destination = flight.destination;

    if (!origin || !destination) {
      const segments = flight.itineraries?.[0]?.segments || [];
      origin = segments.length > 0 ? segments[0].departure?.iataCode : '---';
      destination = segments.length > 0 ? segments[segments.length - 1].arrival?.iataCode : '---';
    }

    origin = origin || '---';
    destination = destination || '---';

    const baggage = flight.baggageInfo || 'Sem informação';

    doc.setFontSize(13);
    doc.setTextColor(33, 37, 41);
    doc.text(title, 20, yStart);

    doc.setFontSize(10);
    let line = yStart + 10;
    const linha = (label, value) => {
      doc.text(`${label}: ${value}`, 20, line);
      line += 7;
    };

    linha('Companhia', flight.airline || '---');
    linha('Voo', flight.flightNumber || flight.itineraries?.[0]?.segments?.[0]?.number || '---');
    linha('Origem', origin);
    linha('Destino', destination);
    linha('Partida', `${depDate} às ${depTime}`);
    linha('Chegada', `${arrDate} às ${arrTime}`);
    linha('Duração', flight.duration || flight.itineraries?.[0]?.duration || '---');
    linha('Cabine', flight.cabin || flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || '---');
    linha('Bagagem', baggage);
    linha('Preço', `R$ ${flight.price?.total || flight.price || '---'}`);
  };

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Mochilei Barato – Bilhete Ida e Volta', 20, 20);

  addSection(outbound, 'Voo de Ida', 35);
  addSection(inbound, 'Voo de Volta', 135);

  doc.save(`Bilhete-${outbound.flightNumber}-${inbound.flightNumber}.pdf`);
}
