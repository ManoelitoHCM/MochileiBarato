// src/components/HomeWithSearch.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchModeSelector from './SearchModeSelector';
import '../css/HomeWithSearch.css';

function HomeWithSearch({ setResults, loading, setLoading }) {
  const navigate = useNavigate();

  const handleSearch = async (filters, isSuggestion = false) => {
    setLoading(true);
    try {
      const endpoint = isSuggestion ? '/api/suggestions' : '/api/destinations';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      const isRoundTrip = data.outbound || data.inbound;

      setResults(
        isRoundTrip
          ? { outbound: data.outbound || [], inbound: data.inbound || [], dictionaries: data.dictionaries }
          : { data: data.data || [], dictionaries: data.dictionaries }
      );

      navigate('/resultados', {
        state: {
          originLabel: filters.originLabel,
          destinationLabel: filters.destinationLabel || null
        }
      });
    } catch (error) {
      alert('Erro ao buscar destinos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container container py-5">
      <h1 className="mb-4 text-center">✈️ Mochilei Barato</h1>
      <div className="search-card">
        <SearchModeSelector onSearch={handleSearch} loading={loading} />
      </div>
    </div>
  );
}

export default HomeWithSearch;
