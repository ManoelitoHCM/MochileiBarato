import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { formatAirline } from '../utils/airlines';

const formatDateTime = (str) =>
  str
    ? new Date(str).toLocaleString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Indefinido';

const renderFlightCard = (dest, idx) => (
  <Card className="shadow-sm mb-3" key={idx}>
    <Card.Body>
      <Card.Title>{dest.origin} → {dest.destination}</Card.Title>
      <p><strong>✈️ Companhia:</strong> {formatAirline(dest.airline)}</p>
      <p><strong>🛫 Partida:</strong> {formatDateTime(dest.departure)}</p>
      <p><strong>🛬 Chegada:</strong> {formatDateTime(dest.arrival)}</p>
      <p><strong>⏱️ Duração:</strong> {dest.duration.replace('PT', '').toLowerCase()}</p>
      <p><strong>💺 Cabine:</strong> <Badge bg="secondary">{dest.cabin}</Badge></p>
      <p><strong>🛑 Escalas:</strong> {dest.stops}</p>
      <p><strong>💰 Preço:</strong> <Badge bg="success">R$ {parseFloat(dest.price).toFixed(2)}</Badge></p>
    </Card.Body>
  </Card>
);

const DestinationList = ({ destinations }) => {
  if (!destinations || (!Array.isArray(destinations) && !destinations.outbound)) {
    return <p className="text-center">Nenhum destino encontrado.</p>;
  }

  // Se for sugestão (array simples)
  if (Array.isArray(destinations)) {
    return (
      <div className="row">
        {destinations.map((dest, idx) => (
          <div className="col-md-6" key={idx}>
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <Card.Title>{dest.name}</Card.Title>
                <p><strong>Atrações:</strong> {dest.attractions?.join(', ') || 'N/A'}</p>
                <p><strong>Duração estimada:</strong> {dest.duration}</p>
                <p><strong>Preço:</strong> R$ {parseFloat(dest.price).toFixed(2)}</p>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // Se for ida e volta
  const { outbound = [], inbound = [] } = destinations;

  return (
    <div className="row">
      <div className="col-md-6">
        <h5 className="text-center">🛫 Voos de Ida</h5>
        {outbound.length === 0 ? <p>Nenhum voo de ida encontrado.</p> : outbound.map(renderFlightCard)}
      </div>
      <div className="col-md-6">
        <h5 className="text-center">🛬 Voos de Volta</h5>
        {inbound.length === 0 ? <p>Nenhum voo de volta encontrado.</p> : inbound.map(renderFlightCard)}
      </div>
    </div>
  );
};

export default DestinationList;
