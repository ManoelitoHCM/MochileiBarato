// src/pages/ResultsPageTraditional.jsx
import React, { useState, useEffect } from 'react';
import FlightCard from '../components/FlightCard';
import '../css/ResultsPage.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateCombinedTicketPdf } from '../utils/generateCombinedTicketsPdf';
import { generateTicketPdf } from '../utils/generateTicketPdf';

const ResultsPageTraditional = ({ results, loading }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const originLabel = location.state?.originLabel;
  const destinationLabel = location.state?.destinationLabel;
  const carriers = location.state?.dictionaries?.carriers || {};

  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedInbound, setSelectedInbound] = useState(null);

  const isRoundTrip = !!results?.outbound?.length && !!results?.inbound?.length;
  console.log("isRoundTrip", isRoundTrip);
  console.log("ResultsPageTraditional - results", results);


  const getCarrierName = (offer) => {
    const code =
      offer?.validatingAirlineCodes?.[0] ||
      offer.airline ||
      offer?.itineraries?.[0]?.segments?.[0]?.carrierCode;

    return carriers[code] || code || 'Companhia';
  };

  const handleSelectFlight = (flight, type) => {
    if (type === 'outbound') {
      console.log("is rount trip ", isRoundTrip);
      setSelectedOutbound(flight);
      if (!isRoundTrip) {
        console.log("🧾 PDF - Gerando bilhete de ida");
        generateTicketPdf(flight, 'Ida', originLabel, destinationLabel);
      }
    } else {
      setSelectedInbound(flight);
    }
  };

  useEffect(() => {
    if (isRoundTrip && selectedOutbound && selectedInbound) {
      generateCombinedTicketPdf(selectedOutbound, selectedInbound, originLabel, destinationLabel);
      setSelectedOutbound(null);
      setSelectedInbound(null);
    }
  }, [selectedOutbound, selectedInbound, isRoundTrip, originLabel, destinationLabel]);

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
                    onSelect={() => handleSelectFlight(offer, 'outbound')}
                    isSelected={selectedOutbound === offer}
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
                    onSelect={() => handleSelectFlight(offer, 'inbound')}
                    isSelected={selectedInbound === offer}
                  />
                ))}
              </div>
            </>
          )}

          {/* Só Ida */}
          {!results?.outbound && Array.isArray(results) && results.length > 0 && (
            <>
              <h3 className="trip-title">🛫 Voos disponíveis</h3>
              <div className="flights-grid">
                {results.map((offer, index) => (
                  <FlightCard
                    key={`single-${index}`}
                    offer={offer}
                    carrierName={getCarrierName(offer)}
                    onSelect={() => handleSelectFlight(offer, 'outbound')}
                    isSelected={selectedOutbound === offer}
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
