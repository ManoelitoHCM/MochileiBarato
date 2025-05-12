import React, { useState, useEffect } from 'react';
import { formatAirline } from '../utils/airlines';

const FiltersBar = ({ originalResults, setFilteredResults }) => {
  const [maxPrice, setMaxPrice] = useState('');
  const [airline, setAirline] = useState('');
  const [stops, setStops] = useState('');
  const [cabin, setCabin] = useState('');

  // Filtragem dinâmica
  useEffect(() => {
    let filtered = [...originalResults];

    if (maxPrice) {
      filtered = filtered.filter(dest => parseFloat(dest.price) <= parseFloat(maxPrice));
    }

    if (airline) {
      filtered = filtered.filter(dest => dest.airline === airline);
    }

    if (stops !== '') {
      filtered = filtered.filter(dest => dest.stops === parseInt(stops));
    }

    if (cabin) {
      filtered = filtered.filter(dest => dest.cabin?.toLowerCase() === cabin.toLowerCase());
    }

    setFilteredResults(filtered);
  }, [maxPrice, airline, stops, cabin, originalResults, setFilteredResults]);

  // Companhias únicas nos resultados
  const airlineOptions = Array.from(
    new Set(originalResults.map(dest => dest.airline).filter(Boolean))
  );

  return (
    <div className="mb-4">
      <h5>🔍 Filtros:</h5>
      <div className="row g-2">
        <div className="col-md-3">
          <input
            type="number"
            placeholder="Preço máximo (R$)"
            className="form-control"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={airline}
            onChange={e => setAirline(e.target.value)}
          >
            <option value="">Companhia aérea</option>
            {airlineOptions.map(code => (
              <option key={code} value={code}>
                {formatAirline(code)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={stops} onChange={e => setStops(e.target.value)}>
            <option value="">Escalas</option>
            <option value="0">Direto</option>
            <option value="1">1 Escala</option>
            <option value="2">2 ou mais</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={cabin} onChange={e => setCabin(e.target.value)}>
            <option value="">Classe</option>
            <option value="ECONOMY">Econômica</option>
            <option value="BUSINESS">Executiva</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
