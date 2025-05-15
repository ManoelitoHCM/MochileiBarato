import React, { useState } from 'react';
import CityAutocomplete from './CityAutocomplete';

const DestinationForm = ({ onSearch, loading }) => {
  const [origin, setOrigin] = useState('');
  const [originLabel, setOriginLabel] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [tripType, setTripType] = useState('one-way');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [budget, setBudget] = useState('');

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const max = new Date();
  max.setDate(max.getDate() + 360);
  const maxDate = max.toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!origin || !departureDate || !budget) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      alert('Informe a data de volta.');
      return;
    }

    onSearch({
      origin,
      destination: destination || null,
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : null,
      tripType,
      budget: Number(budget),
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
        <label className="form-label">Tipo de viagem</label>
        <select
          className="form-select"
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
        >
          <option value="one-way">Só ida</option>
          <option value="round-trip">Ida e volta</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Data de ida</label>
        <input
          type="date"
          className="form-control"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          min={minDate}
          max={maxDate}
          required
        />
      </div>

      {tripType === 'round-trip' && (
        <div className="mb-3">
          <label className="form-label">Data de volta</label>
          <input
            type="date"
            className="form-control"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={departureDate || minDate}
            max={maxDate}
            required
          />
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Orçamento máximo (R$)</label>
        <input
          className="form-control"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
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
