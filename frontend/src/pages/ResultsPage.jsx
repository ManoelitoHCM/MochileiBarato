// src/pages/ResultsPage.jsx
import React, { useState, useEffect } from 'react';
import FlightCard from '../components/FlightCard';
import FiltersBar from '../components/FiltersBar';
import '../css/ResultsPage.css';

const ResultsPage = ({ results, loading }) => {
  const isRoundTrip = results?.outbound && results?.inbound;
  const carriers = results?.dictionaries?.carriers || {};

  const [filteredResults, setFilteredResults] = useState([]);
  const [sortOption, setSortOption] = useState('price');
  const [stopsFilter, setStopsFilter] = useState('all');

  const baseResults = isRoundTrip ? results.outbound : Array.isArray(results) ? results : results?.data || [];

  useEffect(() => {
    let sorted = [...baseResults];

    if (stopsFilter !== 'all') {
      const stopsCount = parseInt(stopsFilter);
      sorted = sorted.filter((offer) => {
        const segments = offer.itineraries?.[0]?.segments || [];
        return (segments.length - 1) === stopsCount || offer.stops === stopsCount;
      });
    }

    sorted.sort((a, b) => {
      const getValue = (val, key) => key?.split('.')?.reduce((acc, k) => acc?.[k], val);
      if (sortOption === 'price') {
        return parseFloat(a.price?.total || a.price) - parseFloat(b.price?.total || b.price);
      } else if (sortOption === 'duration') {
        const durA = (a.itineraries?.[0]?.duration || a.duration || '').replace(/PT|H|M/g, (m) => ({ H: '*60+', M: '', PT: '' }[m]));
        const durB = (b.itineraries?.[0]?.duration || b.duration || '').replace(/PT|H|M/g, (m) => ({ H: '*60+', M: '', PT: '' }[m]));
        return eval(durA) - eval(durB);
      } else if (sortOption === 'date') {
        const dateA = new Date(a.itineraries?.[0]?.segments?.[0]?.departure?.at || a.departure);
        const dateB = new Date(b.itineraries?.[0]?.segments?.[0]?.departure?.at || b.departure);
        return dateA - dateB;
      }
      return 0;
    });

    setFilteredResults(sorted);
  }, [results, sortOption, stopsFilter]);

  const hasResults = () => {
    return filteredResults && filteredResults.length > 0;
  };

  const getCarrierName = (offer) => {
    const code = offer.airline || offer?.itineraries?.[0]?.segments?.[0]?.carrierCode;
    return carriers[code] || code || 'Companhia';
  };

  const renderFlights = () => {
    if (!hasResults()) return null;

    return (
      <>
        <div className="trip-section">
          <h3 className="trip-title">✈️ Ida</h3>
          <div className="filters-bar">
            <label>Escalas:
              <select value={stopsFilter} onChange={(e) => setStopsFilter(e.target.value)}>
                <option value="all">Todas</option>
                {[...new Set(baseResults.map((offer) => {
                  const segments = offer.itineraries?.[0]?.segments || [];
                  return offer.stops ?? (segments.length - 1);
                }))]
                  .sort((a, b) => a - b)
                  .map((stops) => (
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

          <div className="flights-grid">
            {filteredResults.map((offer, index) => (
              <FlightCard
                key={`outbound-${index}`}
                offer={offer}
                carrierName={getCarrierName(offer)}
              />
            ))}
          </div>
        </div>

        {isRoundTrip && results.inbound && results.inbound.length > 0 && (
          <div className="trip-section">
            <h3 className="trip-title">🛬 Volta</h3>
            <div className="flights-grid">
              {results.inbound.map((offer, index) => (
                <FlightCard
                  key={`inbound-${index}`}
                  offer={offer}
                  carrierName={getCarrierName(offer)}
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Resultados da busca</h2>
        <p className="results-subtitle">Confira as melhores opções para sua viagem</p>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Buscando voos, por favor aguarde...</p>
        </div>
      )}

      {!loading && hasResults() && (
        <div className="results-content">
          {!isRoundTrip && (
            <FiltersBar
              originalResults={results?.data || results || []}
              setFilteredResults={setFilteredResults}
            />
          )}
          {renderFlights()}
        </div>
      )}

      {!loading && !hasResults() && (
        <div className="no-results">
          <p>Nenhum resultado encontrado para sua busca.</p>
          <p>Tente ajustar seus filtros ou critérios de pesquisa.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
