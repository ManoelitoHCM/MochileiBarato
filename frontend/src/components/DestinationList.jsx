import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { formatAirline } from '../utils/airlines';

const formatDateTime = (str) =>
  str ? new Date(str).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Indefinido';

const DestinationList = ({ destinations }) => {
  if (!destinations || destinations.length === 0) {
    return <p className="text-center">Nenhum destino encontrado.</p>;
  }

  return (
    <div className="row">
      {destinations.map((dest, idx) => (
        <div className="col-md-6 mb-4" key={idx}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              {/* Sugestões (com nome e atrações) */}
              {dest.name ? (
                <>
                  <Card.Title>{dest.name}</Card.Title>
                  <p><strong>Atrações:</strong> {dest.attractions?.join(', ') || 'N/A'}</p>
                  <p><strong>Duração estimada:</strong> {dest.duration}</p>
                  <p><strong>Preço:</strong> R$ {parseFloat(dest.price).toFixed(2)}</p>
                </>
              ) : (
                // Voos reais detalhados
                <>
                  <Card.Title>{dest.origin} → {dest.destination}</Card.Title>
                  <p><strong>✈️ Companhia:</strong> {formatAirline(dest.airline)}</p>
                  <p><strong>🛫 Partida:</strong> {formatDateTime(dest.departureTime)}</p>
                  <p><strong>🛬 Chegada:</strong> {formatDateTime(dest.arrivalTime)}</p>
                  <p><strong>⏱️ Duração:</strong> {dest.duration.replace('PT', '').toLowerCase()}</p>
                  <p>
                    <strong>💺 Cabine:</strong> <Badge bg="secondary">{dest.cabin}</Badge>
                  </p>
                  <p>
                    <strong>🛑 Escalas:</strong> {dest.stops} {dest.connections?.length > 0 && `(${dest.connections.join(', ')})`}
                  </p>
                  <p><strong>💰 Preço:</strong> <Badge bg="success">R$ {parseFloat(dest.price).toFixed(2)}</Badge></p>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default DestinationList;
