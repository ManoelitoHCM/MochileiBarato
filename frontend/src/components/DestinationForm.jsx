import React, { useState } from 'react';
import CityAutocomplete from './CityAutocomplete';

const DestinationForm = ({ onSearch, loading }) => {
  const [origin, setOrigin] = useState('');
  const [originLabel, setOriginLabel] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [month, setMonth] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !month || !budget) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    onSearch({
      origin,
      destination: destination || null,
      month,
      year: month.split('-')[0], // extrai ano do input "2025-12"
      budget: Number(budget)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <label className="form-label">Cidade de origem</label>
        <CityAutocomplete
          onSelect={(city) => {
            setOrigin(city.iataCode);
            setOriginLabel(`${city.name} (${city.iataCode})`);
          }}
          placeholder="Digite sua cidade de origem"
        />
        <input className="form-control mt-2" type="text" value={originLabel} disabled />
      </div>

      <div className="mb-3">
        <label className="form-label">Cidade de destino (opcional)</label>
        <CityAutocomplete
          onSelect={(city) => {
            setDestination(city.iataCode);
            setDestinationLabel(`${city.name} (${city.iataCode})`);
          }}
          placeholder="Digite sua cidade de destino"
        />
        <input className="form-control mt-2" type="text" value={destinationLabel} disabled />
      </div>

      <div className="mb-3">
        <label className="form-label">Mês da viagem</label>
        <input
          className="form-control"
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Orçamento máximo (R$)</label>
        <input
          className="form-control"
          type="number"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          required
        />
      </div>

      <button className="btn btn-primary w-100" type="submit" disabled={loading}>
        {loading ? 'Buscando voos...' : 'Buscar voos'}
      </button>
    </form>
  );
};

export default DestinationForm;
