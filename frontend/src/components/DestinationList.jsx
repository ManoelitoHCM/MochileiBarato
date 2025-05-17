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
      minute: '2-digit',
    })
    : 'Indefinido';

const renderFlightCard = (flight, index) => (
  <Card className="shadow-sm mb-4">
    <Card.Body>
      <Card.Title>{flight.origin} → {flight.destination}</Card.Title>
      <p><strong>✈️ Companhia:</strong> {formatAirline(flight.airline)}</p>
      <p><strong>🛫 Partida:</strong> {formatDateTime(flight.departure)}</p>
      <p><strong>🛬 Chegada:</strong> {formatDateTime(flight.arrival)}</p>
      <p><strong>⏱️ Duração:</strong> {flight.duration.replace('PT', '').toLowerCase()}</p>
      <p><strong>💺 Cabine:</strong> <Badge bg="secondary">{flight.cabin}</Badge></p>
      <p><strong>🛑 Escalas:</strong> {flight.stops}</p>
      <p><strong>💰 Preço:</strong> <Badge bg="success">R$ {parseFloat(flight.price).toFixed(2)}</Badge></p>
    </Card.Body>
  </Card>
);

const DestinationList = ({ destinations }) => {
  if (!destinations || (!destinations.outbound?.length && !destinations.inbound?.length)) {
    return <p className="text-center">Nenhum voo encontrado.</p>;
  }

  const { outbound = [], inbound = [] } = destinations;
  const isRoundTrip = inbound.length > 0;

  if (isRoundTrip) {
    return (
      <div className="row">
        <div className="col-md-6">
          <h4 className="text-center mb-3">✈️ Voos de ida</h4>
          {outbound.map((flight, idx) => (
            <div key={idx}>{renderFlightCard(flight, idx)}</div>
          ))}
        </div>
        <div className="col-md-6">
          <h4 className="text-center mb-3">🛬 Voos de volta</h4>
          {inbound.map((flight, idx) => (
            <div key={idx}>{renderFlightCard(flight, idx)}</div>
          ))}
        </div>
      </div>
    );
  }

  // Caso só haja ida
  return (
    <>
      <h4 className="text-center mb-3">✈️ Voos de ida</h4>
      <div className="row">
        {outbound.map((flight, idx) => (
          <div className="col-md-6 col-lg-4" key={idx}>
            {renderFlightCard(flight, idx)}
          </div>
        ))}
      </div>
    </>
  );
};

export default DestinationList;
