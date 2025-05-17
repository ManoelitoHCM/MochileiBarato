import React, { useState, useEffect, useMemo } from 'react';
import { Form } from 'react-bootstrap';

const FiltersBar = ({ originalResults, setFilteredResults }) => {
  const [selectedAirline, setSelectedAirline] = useState('');
  const [selectedStops, setSelectedStops] = useState('');
  const [sortBy, setSortBy] = useState('');

  const isRoundTrip = useMemo(
    () => originalResults.outbound && Array.isArray(originalResults.outbound),
    [originalResults]
  );

  const flights = useMemo(() => {
    return isRoundTrip
      ? [...(originalResults.outbound || []), ...(originalResults.inbound || [])]
      : originalResults || [];
  }, [originalResults, isRoundTrip]);

  const availableAirlines = useMemo(() => {
    return [...new Set(flights.map(f => f.airline))];
  }, [flights]);

  const availableStops = useMemo(() => {
    return [...new Set(flights.map(f => f.stops))].sort((a, b) => a - b);
  }, [flights]);

  useEffect(() => {
    let filtered = flights;

    if (selectedAirline) {
      filtered = filtered.filter(f => f.airline === selectedAirline);
    }

    if (selectedStops !== '') {
      filtered = filtered.filter(f => f.stops === parseInt(selectedStops));
    }

    if (sortBy === 'price') {
      filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'duration') {
      const parseDuration = str => {
        const match = str.match(/PT(\d+)H(\d+)?M?/);
        const hours = match ? parseInt(match[1] || 0) : 0;
        const minutes = match ? parseInt(match[2] || 0) : 0;
        return hours * 60 + minutes;
      };
      filtered = [...filtered].sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    } else if (sortBy === 'departure') {
      filtered = [...filtered].sort((a, b) => new Date(a.departure) - new Date(b.departure));
    }

    if (isRoundTrip) {
      const outboundFiltered = filtered.filter(f => originalResults.outbound.some(o => o.departure === f.departure));
      const inboundFiltered = filtered.filter(f => originalResults.inbound.some(i => i.departure === f.departure));
      setFilteredResults({ outbound: outboundFiltered, inbound: inboundFiltered });
    } else {
      setFilteredResults(filtered);
    }
  }, [selectedAirline, selectedStops, sortBy, flights, originalResults, isRoundTrip, setFilteredResults]);

  return (
    <div className="row mb-4">
      <div className="col-md-4">
        <Form.Select value={selectedAirline} onChange={e => setSelectedAirline(e.target.value)}>
          <option value="">Todas as companhias</option>
          {availableAirlines.map((code, idx) => (
            <option key={idx} value={code}>{code}</option>
          ))}
        </Form.Select>
      </div>
      <div className="col-md-4">
        <Form.Select value={selectedStops} onChange={e => setSelectedStops(e.target.value)}>
          <option value="">Todas as escalas</option>
          {availableStops.map((stop, idx) => (
            <option key={idx} value={stop}>
              {stop === 0 ? 'Voo direto' : `${stop} escala${stop > 1 ? 's' : ''}`}
            </option>
          ))}
        </Form.Select>
      </div>
      <div className="col-md-4">
        <Form.Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">Ordenar por</option>
          <option value="price">Preço</option>
          <option value="duration">Duração</option>
          <option value="departure">Horário de partida</option>
        </Form.Select>
      </div>
    </div>
  );
};

export default FiltersBar;
