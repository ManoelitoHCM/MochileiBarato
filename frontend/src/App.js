import React, { useState } from 'react';
import DestinationForm from './components/DestinationForm';
import DestinationList from './components/DestinationList';
import FiltersBar from './components/FiltersBar';
import api from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [originalResults, setOriginalResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      const res = await api.post('/destinations', filters);
      setOriginalResults(res.data);
      setFilteredResults(res.data);
    } catch (err) {
      console.error('Erro ao buscar destinos:', err);
      alert('Erro ao buscar destinos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">✈️ Mochilei Barato</h1>

      {/* Formulário com loading passado como prop */}
      <DestinationForm onSearch={handleSearch} loading={loading} />

      {/* Indicador de carregamento */}
      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p>Buscando voos, por favor aguarde...</p>
        </div>
      )}

      {/* Filtros e resultados */}
      {!loading && originalResults.length > 0 && (
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
