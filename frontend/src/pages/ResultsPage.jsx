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
  const carriers = results?.dictionaries?.carriers || {};

  const [filteredResults, setFilteredResults] = useState([]);
  const [filteredInbound, setFilteredInbound] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [stopsFilter, setStopsFilter] = useState('all');
  const [visibleOutbound, setVisibleOutbound] = useState(5);
  const [visibleInbound, setVisibleInbound] = useState(5);
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedInbound, setSelectedInbound] = useState(null);

  const baseOutbound = useMemo(() => {
    return isRoundTrip
      ? results.outbound
      : Array.isArray(results)
        ? results
        : results?.data || [];
  }, [results, isRoundTrip]);

  const baseInbound = useMemo(() => {
    return isRoundTrip ? results.inbound || [] : [];
  }, [results, isRoundTrip]);

  const parseDuration = (str) => {
    const match = str?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(match?.[1] || 0, 10);
    const minutes = parseInt(match?.[2] || 0, 10);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const sortAndFilter = (flights) => {
      let sorted = [...flights];

      if (stopsFilter !== 'all') {
        const stopsCount = parseInt(stopsFilter);
        sorted = sorted.filter((offer) => {
          const segments = offer.itineraries?.[0]?.segments || [];
          return (segments.length - 1) === stopsCount || offer.stops === stopsCount;
        });
      }

      sorted.sort((a, b) => {
        if (sortOption === 'price') {
          return parseFloat(a.price?.total || a.price) - parseFloat(b.price?.total || b.price);
        } else if (sortOption === 'duration') {
          return parseDuration(a.itineraries?.[0]?.duration || a.duration || '') -
            parseDuration(b.itineraries?.[0]?.duration || b.duration || '');
        } else if (sortOption === 'date') {
          const dateA = new Date(a.itineraries?.[0]?.segments?.[0]?.departure?.at || a.departure);
          const dateB = new Date(b.itineraries?.[0]?.segments?.[0]?.departure?.at || b.departure);
          return dateA - dateB;
        }
        return 0;
      });

      return sorted;
    };

    setFilteredResults(sortAndFilter(baseOutbound));
    setFilteredInbound(sortAndFilter(baseInbound));
    setVisibleOutbound(5);
    setVisibleInbound(5);
  }, [baseOutbound, baseInbound, sortOption, stopsFilter]);

  const getCarrierName = (offer) => {
    const code = offer.airline || offer?.itineraries?.[0]?.segments?.[0]?.carrierCode;
    return carriers[code] || code || 'Companhia';
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Resultados da busca</h2>
        <p className="results-subtitle">
          {originLabel && destinationLabel
            ? `Exibindo voos de ${originLabel} para ${destinationLabel}`
            : 'Confira as melhores opções para sua viagem'}
        </p>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Buscando voos, por favor aguarde...</p>
        </div>
      )}

      {!loading && filteredResults.length > 0 && (
        <div className="results-content">
          <div className="results-controls">
            <div className="redo-search-bar">
              <button className="redo-search-button" onClick={() => window.history.back()}>
                <span className="search-icon">🔍</span> Refazer busca
              </button>
            </div>

            <div className="filters-bar">
              <label>Escalas:
                <select value={stopsFilter} onChange={(e) => setStopsFilter(e.target.value)}>
                  <option value="all">Todas</option>
                  {[...new Set(baseOutbound.map((offer) => {
                    const segments = offer.itineraries?.[0]?.segments || [];
                    return offer.stops ?? (segments.length - 1);
                  }))].sort((a, b) => a - b).map((stops) => (
                    <option key={stops} value={stops}>
                      {stops === 0 ? 'Voo direto' : `${stops} escala${stops > 1 ? 's' : ''}`}
                    </option>
                  ))}
                </select>
              </label>

              <label>Ordenar por:
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="price">Preço</option>
                  <option value="duration">Duração</option>
                  <option value="date">Data</option>
                </select>
              </label>
            </div>
          </div>

          <div className="trip-section">
            <h3 className="trip-title">✈️ Ida</h3>
            <div className="flights-grid">
              {filteredResults.slice(0, visibleOutbound).map((offer, index) => (
                <FlightCard
                  key={`outbound-${index}`}
                  offer={offer}
                  carrierName={getCarrierName(offer)}
                  isSelected={selectedOutbound?.id === offer.id}
                  onSelect={() => {
                    if (!selectedOutbound) {
                      const origin = offer.origin;
                      const destination = offer.destination;
                      const pricing = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
                      const baggageInfo = `${pricing?.includedCabinBags?.quantity || 0} mão / ${pricing?.includedCheckedBags?.quantity || 0} desp.`;

                      const enrichedOffer = {
                        ...offer,
                        origin,
                        destination,
                        baggageInfo
                      };

                      setSelectedOutbound(enrichedOffer);
                    } else {
                      alert('Você já selecionou um voo de ida. Selecione agora um voo de volta.');
                    }
                  }}
                />
              ))}
            </div>
            {visibleOutbound < filteredResults.length && (
              <div className="load-more-container">
                <button className="load-more-button" onClick={() => setVisibleOutbound(visibleOutbound + 5)}>
                  Ver mais
                </button>
              </div>
            )}
          </div>

          {isRoundTrip && filteredInbound.length > 0 && (
            <div className="trip-section">
              <h3 className="trip-title">🛬 Volta</h3>
              <div className="flights-grid">
                {filteredInbound.slice(0, visibleInbound).map((offer, index) => (
                  <FlightCard
                    key={`inbound-${index}`}
                    offer={offer}
                    carrierName={getCarrierName(offer)}
                    isSelected={selectedInbound?.id === offer.id}
                    onSelect={() => {
                      if (!selectedOutbound) {
                        alert("Selecione primeiro um voo de ida.");
                        return;
                      }
                      if (!selectedInbound) {
                        const origin = offer.origin;
                        const destination = offer.destination;
                        const pricing = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
                        const baggageInfo = `${pricing?.includedCabinBags?.quantity || 0} mão / ${pricing?.includedCheckedBags?.quantity || 0} desp.`;

                        console.log("origin", origin);
                        console.log("destination", destination);

                        const enrichedOffer = {
                          ...offer,
                          origin,
                          destination,
                          baggageInfo
                        };

                        setSelectedInbound(enrichedOffer);
                        generateCombinedTicketPdf(selectedOutbound, enrichedOffer);
                        setSelectedOutbound(null);
                        setSelectedInbound(null);
                      } else {
                        alert("Você já selecionou um voo de volta.");
                      }
                    }}
                  />
                ))}
              </div>
              {visibleInbound < filteredInbound.length && (
                <div className="load-more-container">
                  <button className="load-more-button" onClick={() => setVisibleInbound(visibleInbound + 5)}>
                    Ver mais
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && filteredResults.length === 0 && (
        <div className="no-results">
          <p>Nenhum resultado encontrado para sua busca.</p>
          <p>Tente ajustar seus filtros ou critérios de pesquisa.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
