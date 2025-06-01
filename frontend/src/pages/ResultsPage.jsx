// src/pages/ResultsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import FlightCard from '../components/FlightCard';
import '../css/ResultsPage.css';
import { useLocation } from 'react-router-dom';
import { generateCombinedTicketPdf } from '../utils/generateCombinedTicketsPdf';

const ResultsPage = ({ results, loading }) => {
  const location = useLocation();
  const originLabel = location.state?.originLabel;
  const destinationLabel = location.state?.destinationLabel;

  const isRoundTrip = results?.outbound && results?.inbound;
  const isSuggestion = results?.data && Array.isArray(results.data);
  const carriers = results?.dictionaries?.carriers || {};

  const [visiblePerCity, setVisiblePerCity] = useState({});

  const getCarrierName = (offer) => {
    const code = offer.airline || offer?.itineraries?.[0]?.segments?.[0]?.carrierCode;
    return carriers[code] || code || 'Companhia';
  };

  const getCityName = (iataCode) => {
    return results?.dictionaries?.locations?.[iataCode]?.cityName || iataCode;
  };

  const groupedByDestination = useMemo(() => {
    const flights = results?.data || [];
    const groups = {};
    flights.forEach((offer) => {
      const code = offer.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode || offer.destination;
      if (!groups[code]) groups[code] = [];
      groups[code].push(offer);
    });
    return groups;
  }, [results]);

  const handleLoadMore = (cityCode) => {
    setVisiblePerCity((prev) => ({
      ...prev,
      [cityCode]: (prev[cityCode] || 3) + 3
    }));
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Resultados da busca</h2>
        <p className="results-subtitle">
          {originLabel && destinationLabel
            ? `Exibindo voos de ${originLabel} para ${destinationLabel}`
            : originLabel
              ? `Sugestões de voos a partir de ${originLabel}`
              : 'Confira as melhores opções para sua viagem'}
        </p>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Buscando voos, por favor aguarde...</p>
        </div>
      )}

      {!loading && isSuggestion && Object.keys(groupedByDestination).length > 0 && (
        <div className="results-content">
          {Object.entries(groupedByDestination).map(([cityCode, offers]) => (
            <div key={cityCode} className="trip-section">
              <h3 className="trip-title">
                🌍 Voos de {offers[0]?.originName || originLabel || 'Origem'} ({offers[0]?.origin || ''}) para {offers[0]?.destinationName || getCityName(cityCode).toUpperCase()} ({cityCode})
              </h3>
              <div className="flights-grid">
                {offers.slice(0, visiblePerCity[cityCode] || 3).map((offer, index) => (
                  <FlightCard
                    key={`${cityCode}-${index}`}
                    offer={offer}
                    carrierName={getCarrierName(offer)}
                  />
                ))}
              </div>
              {offers.length > (visiblePerCity[cityCode] || 3) && (
                <div className="load-more-container">
                  <button className="load-more-button" onClick={() => handleLoadMore(cityCode)}>
                    Ver mais voos para {getCityName(cityCode)}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !isSuggestion && (
        <div className="results-content">
          <p>Nenhum resultado encontrado ou modo de exibição ainda não suportado.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
