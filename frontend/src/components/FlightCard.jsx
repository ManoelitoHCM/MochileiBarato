// src/components/FlightCard.jsx
import React from 'react';
import '../css/FlightCard.css';

const FlightCard = ({ offer, carrierName, showExtras = true, onSelect, isSelected }) => {
  const isSimplified = !offer.itineraries;

  const formatDuration = (duration) => {
    return duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '';
  };

  const formatTime = (datetime) => {
    return datetime?.split('T')[1]?.substring(0, 5) || '';
  };

  const formatDate = (datetime) => {
    return datetime?.split('T')[0] || '';
  };

  const renderExtras = (data) => {
    return (
      <div className="extras">
        {data.flightNumber && <span><strong>Voo:</strong> {data.flightNumber}</span>}
        {data.aircraft && <span><strong>Aeronave:</strong> {data.aircraft}</span>}
        {data.cabin && <span><strong>Cabine:</strong> {data.cabin}</span>}
        {data.baggageInfo && <span><strong>Bagagem:</strong> {data.baggageInfo}</span>}
      </div>
    );
  };

  if (isSimplified) {
    const baggageInfo = `${offer.includedCabinBags || 0} mão / ${offer.includedCheckedBags || 0} desp.`;
    return (
      <div className={`flight-card ${isSelected ? "selected" : ""}`}>
        <div className="flight-header">
          <span className="airline">{carrierName || offer.airline || 'Companhia'}</span>
          <span className="price">R$ {offer.price}</span>
        </div>

        <div className="flight-details">
          <div className="route">
            <div className="departure">
              <span className="time">{formatTime(offer.departure)}</span>
              <span className="airport">Origem</span>
            </div>

            <div className="duration">
              <div className="line"></div>
              <span>{formatDuration(offer.duration)}</span>
              <div className="line"></div>
            </div>

            <div className="arrival">
              <span className="time">{formatTime(offer.arrival)}</span>
              <span className="airport">Destino</span>
            </div>
          </div>

          <div className="flight-meta">
            <span className="stops">
              {offer.stops === 0 ? 'Voo direto' : `${offer.stops} escala(s)`}
            </span>
            <span className="date">{formatDate(offer.departure)}</span>
          </div>

          {showExtras && renderExtras({
            flightNumber: offer.flightNumber,
            aircraft: offer.aircraft,
            cabin: offer.cabin,
            baggageInfo
          })}
        </div>
        <button className="select-button" onClick={onSelect}>
          Selecionar voo
        </button>
      </div>
    );
  }

  const { itineraries, price, travelerPricings } = offer;
  const firstItinerary = itineraries[0];
  const firstSegment = firstItinerary.segments[0];
  const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];
  const totalStops = firstItinerary.segments.length - 1;
  const pricingInfo = travelerPricings?.[0]?.fareDetailsBySegment?.[0] || {};
  const baggageInfo = `${pricingInfo.includedCabinBags?.quantity || 0} mão / ${pricingInfo.includedCheckedBags?.quantity || 0} desp.`;

  return (
    <div className={`flight-card ${isSelected ? "selected" : ""}`}>
      <div className="flight-header">
        <span className="airline">{carrierName || firstSegment.carrierCode}</span>
        <span className="price">R$ {price.total}</span>
      </div>

      <div className="flight-details">
        <div className="route">
          <div className="departure">
            <span className="time">{formatTime(firstSegment.departure.at)}</span>
            <span className="airport">{firstSegment.departure.iataCode}</span>
          </div>

          <div className="duration">
            <div className="line"></div>
            <span>{formatDuration(firstItinerary.duration)}</span>
            <div className="line"></div>
          </div>

          <div className="arrival">
            <span className="time">{formatTime(lastSegment.arrival.at)}</span>
            <span className="airport">{lastSegment.arrival.iataCode}</span>
          </div>
        </div>

        <div className="flight-meta">
          <span className="stops">
            {totalStops === 0 ? 'Voo direto' : `${totalStops} escala(s)`}
          </span>
          <span className="date">{formatDate(firstSegment.departure.at)}</span>
        </div>

        {showExtras && renderExtras({
          flightNumber: firstSegment.number,
          aircraft: firstSegment.aircraft?.code,
          cabin: pricingInfo.cabin,
          baggageInfo
        })}
      </div>

      {isSelected ? (
          <button className="select-button selected" disabled>Selecionado</button>
        ) : (
          <button className="select-button" onClick={onSelect}>Selecionar voo</button>
        )}
    </div>
  );
};

export default FlightCard;
