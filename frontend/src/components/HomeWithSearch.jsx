// src/components/HomeWithSearch.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchModeSelector from './SearchModeSelector';
import '../css/HomeWithSearch.css';

function HomeWithSearch({ setResults, loading, setLoading }) {
  const navigate = useNavigate();

  const handleSearch = async (filters) => {
    setLoading(true);

    try {
      const res = await fetch(
        filters.searchMode === 'suggestion' ? '/api/suggestions' : '/api/flights',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters),
        }
      );

      const data = await res.json();
      setResults(data);

      navigate(
        filters.searchMode === 'suggestion' ? '/results-suggestion' : '/results-traditional',
        {
          state: {
            originLabel: filters.originLabel,
            destinationLabel: filters.destinationLabel,
            dictionaries: data.dictionaries
          },
        }
      );
    } catch (err) {
      console.error('Erro ao buscar voos:', err);
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
