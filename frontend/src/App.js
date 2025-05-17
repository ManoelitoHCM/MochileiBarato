import React, { useState } from 'react';
import DestinationList from './components/DestinationList';
import FiltersBar from './components/FiltersBar';
import SearchModeSelector from './components/SearchModeSelector';
import api from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [originalResults, setOriginalResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      const res = await api.post('/destinations', filters);

      // Se resposta tiver outbound/inbound, é voo tradicional com ida e volta
      if (res.data.outbound || res.data.inbound) {
        setOriginalResults({
          outbound: res.data.outbound || [],
          inbound: res.data.inbound || []
        });
        setFilteredResults({
          outbound: res.data.outbound || [],
          inbound: res.data.inbound || []
        });
      } else {
        // Caso seja apenas sugestões (array)
        setOriginalResults(res.data);
        setFilteredResults(res.data);
      }
    } catch (err) {
      console.error('Erro ao buscar destinos:', err);
      alert('Erro ao buscar destinos.');
    } finally {
      setLoading(false);
    }
  };

  const hasResults = () => {
    if (!filteredResults) return false;
    if (Array.isArray(filteredResults)) return filteredResults.length > 0;
    return (
      (filteredResults.outbound && filteredResults.outbound.length > 0) ||
      (filteredResults.inbound && filteredResults.inbound.length > 0)
    );
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">✈️ Mochilei Barato</h1>
      <SearchModeSelector onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p>Buscando voos, por favor aguarde...</p>
        </div>
      )}

      {!loading && hasResults() && (
        <>
          <FiltersBar
            originalResults={originalResults}
            setFilteredResults={setFilteredResults}
          />
          <DestinationList destinations={filteredResults} />
        </>
      )}

    </div>
  );
}

export default App;
