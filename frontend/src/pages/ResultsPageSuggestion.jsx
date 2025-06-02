// src/pages/ResultsPageSuggestion.jsx
import React, { useState, useMemo, useEffect } from 'react';
import FlightCard from '../components/FlightCard';
import '../css/ResultsPage.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultsPageSuggestion = ({ results, loading }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const originLabel = location.state?.originLabel;
  const carriers = location.state?.dictionaries?.carriers || {};
  const locations = location.state?.dictionaries?.locations || {};

  const [visiblePerCity, setVisiblePerCity] = useState({});

  const getCarrierName = (offer) => {
    const code =
      offer?.validatingAirlineCodes?.[0] ||
      offer.airline ||
      offer?.itineraries?.[0]?.segments?.[0]?.carrierCode;
    return carriers[code] || code || 'Companhia';
  };

  const getCityName = (iataCode) => {
    return locations?.[iataCode]?.cityName || iataCode;
  };

  const groupedByDestination = useMemo(() => {
    const flights = results?.data || [];
    const groups = {};
    flights.forEach((offer) => {
      const code = offer.destination || offer.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.iataCode;
      if (!groups[code]) groups[code] = [];
      groups[code].push(offer);
    });
    return groups;
  }, [results]);

  const handleLoadMore = (cityCode) => {
    setVisiblePerCity((prev) => ({
      ...prev,
      [cityCode]: (prev[cityCode] || 3) + 3,
    }));
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Sugestões de destinos</h2>
        <p className="results-subtitle">Voos saindo de {originLabel}</p>
        <button className="back-button" onClick={() => navigate('/')}>
          🔄 Refazer busca
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando sugestões...</p>
        </div>
      ) : (
        Object.entries(groupedByDestination).map(([cityCode, offers]) => (
          <div key={cityCode} className="trip-section">
            <h3 className="trip-title">
              🌍 Voos de {originLabel} para {offers[0]?.destinationName || getCityName(cityCode)} ({cityCode})
            </h3>
            <div className="flights-grid">
              {offers.slice(0, visiblePerCity[cityCode] || 3).map((offer, index) => (
                <FlightCard
                  key={`${cityCode}-${index}`}
                  offer={offer}
                  carrierName={getCarrierName(offer)}
                  showExtras={true}
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
        ))
      )}
    </div>
  );
};

export default ResultsPageSuggestion;
