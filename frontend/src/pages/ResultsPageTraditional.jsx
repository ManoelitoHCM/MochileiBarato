import React from 'react';
import FlightCard from '../components/FlightCard';
import '../css/ResultsPage.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultsPageTraditional = ({ results, loading }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const originLabel = location.state?.originLabel;
  const destinationLabel = location.state?.destinationLabel;

  // Usa os dicionários enviados via location.state (garantido no redirect)
  const carriers = location.state?.dictionaries?.carriers || {};

  const getCarrierName = (offer) => {
    const code =
      offer?.validatingAirlineCodes?.[0] ||
      offer.airline ||
      offer?.itineraries?.[0]?.segments?.[0]?.carrierCode;

    return carriers[code] || code || 'Companhia';
  };


  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Resultados da busca</h2>
        <p className="results-subtitle">
          {originLabel && destinationLabel
            ? `Exibindo voos de ${originLabel} para ${destinationLabel}`
            : 'Confira as opções disponíveis'}
        </p>
        <button className="back-button" onClick={() => navigate('/')}>
          🔄 Refazer busca
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Buscando voos...</p>
        </div>
      ) : (
        <>
          {/* Voos de Ida */}
          {Array.isArray(results?.outbound) && results.outbound.length > 0 && (
            <>
              <h3 className="trip-title">🛫 Voos de ida</h3>
              <div className="flights-grid">
                {results.outbound.map((offer, index) => (
                  <FlightCard
                    key={`outbound-${index}`}
                    offer={offer}
                    carrierName={getCarrierName(offer)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Voos de Volta */}
          {Array.isArray(results?.inbound) && results.inbound.length > 0 && (
            <>
              <h3 className="trip-title">🛬 Voos de volta</h3>
              <div className="flights-grid">
                {results.inbound.map((offer, index) => (
                  <FlightCard
                    key={`inbound-${index}`}
                    offer={offer}
                    carrierName={getCarrierName(offer)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Somente Ida (quando results é um array simples) */}
          {!results?.outbound && Array.isArray(results) && results.length > 0 && (
            <>
              <h3 className="trip-title">🛫 Voos disponíveis</h3>
              <div className="flights-grid">
                {results.map((offer, index) => (
                  <FlightCard
                    key={`single-${index}`}
                    offer={offer}
                    carrierName={getCarrierName(offer)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsPageTraditional;
