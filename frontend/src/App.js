import React, { useState } from 'react';
import DestinationForm from './components/DestinationForm';
import DestinationList from './components/DestinationList';
import api from './services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      const res = await api.post('/destinations', filters);
      setDestinations(res.data);
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
      <DestinationForm onSearch={handleSearch} />
      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <DestinationList destinations={destinations} />
      )}
    </div>
  );
}

export default App;
