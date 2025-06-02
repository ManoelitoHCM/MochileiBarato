// src/utils/generateCombinedTicketPdf.js
import jsPDF from 'jspdf';

export function generateCombinedTicketPdf(outbound, inbound, originLabel, destinationLabel) {
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

  const addSection = (flight, title, yStart, origem, destino) => {
    const { date: depDate, time: depTime } = format(
      flight.departure || flight.itineraries?.[0]?.segments?.[0]?.departure?.at
    );
    const { date: arrDate, time: arrTime } = format(
      flight.arrival || flight.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.at
    );

    const segments = flight.itineraries?.[0]?.segments || [];
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

    linha('Companhia', flight.airline || segments[0]?.carrierCode || '---');
    linha('Voo', flight.flightNumber || segments[0]?.number || '---');
    linha('Origem', origem || '---');
    linha('Destino', destino || '---');
    linha('Partida', `${depDate} às ${depTime}`);
    linha('Chegada', `${arrDate} às ${arrTime}`);
    linha('Duração', flight.duration || flight.itineraries?.[0]?.duration || '---');
    linha('Cabine', flight.cabin || flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || '---');
    linha('Bagagem', baggage);
    linha('Preço', `R$ ${flight.price?.total || flight.price || '---'}`);
  };

  // Cabeçalho geral
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Mochilei Barato – Bilhete Ida e Volta', 20, 20);
  doc.setFontSize(12);
  doc.text(`Trajeto: ${originLabel || '---'} - ${destinationLabel || '---'} - ${originLabel || '---'}`, 20, 28);

  // Seções com lógica de origem/destino invertida na volta
  addSection(outbound, 'Voo de Ida', 40, originLabel, destinationLabel);
  addSection(inbound, 'Voo de Volta', 140, destinationLabel, originLabel);

  const flightOut = outbound.flightNumber || outbound.itineraries?.[0]?.segments?.[0]?.number || 'IDA';
  const flightIn = inbound?.flightNumber || inbound?.itineraries?.[0]?.segments?.[0]?.number || 'VOLTA';

  doc.save(`Bilhete-${flightOut}-${flightIn}.pdf`);
}
