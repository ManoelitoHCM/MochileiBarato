import React, { useState } from 'react';
import CityAutocomplete from './CityAutocomplete';
import '../css/DestinationForm.css';
import '../css/CityInput.css';

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
    <form onSubmit={handleSubmit} className="destination-form">
      {/* Cidade de Origem - Versão Simplificada */}
      <div className="form-group">
        <label className="form-label">
          <span className="form-icon">📍</span>
          Cidade de origem
        </label>
        <div className="city-input-container">
          <CityAutocomplete
            onSelect={(city) => {
              setOrigin(city.iataCode);
              setOriginLabel(`${city.name} (${city.iataCode})`);
            }}
            placeholder="Ex: São Paulo (GRU)"
          />
        </div>
      </div>

      {/* Cidade de Destino - Versão Simplificada */}
      <div className="form-group">
        <label className="form-label">
          <span className="form-icon">✈️</span>
          Cidade de destino
        </label>
        <div className="city-input-container">
          <CityAutocomplete
            onSelect={(city) => {
              setDestination(city.iataCode);
              setDestinationLabel(`${city.name} (${city.iataCode})`);
            }}
            placeholder="Ex: Rio de Janeiro (GIG)"
          />
        </div>
      </div>

      {/* Tipo de Viagem */}
      <div className="form-group">
        <label className="form-label">
          <span className="form-icon">🔄</span>
          Tipo de viagem
        </label>
        <select
          className="form-select"
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
        >
          <option value="one-way">Só ida</option>
          <option value="round-trip">Ida e volta</option>
        </select>
      </div>

      {/* Datas */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <span className="form-icon">📅</span>
            Data de ida
          </label>
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
          <div className="form-group">
            <label className="form-label">
              <span className="form-icon">📅</span>
              Data de volta
            </label>
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
      </div>

      {/* Orçamento */}
      <div className="form-group">
        <label className="form-label">
          <span className="form-icon">💰</span>
          Orçamento
        </label>
        <div className="budget-input">
          <span className="currency">R$</span>
          <input
            className="form-control"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            max={9999}
            min={1}
            required
          />
        </div>
      </div>

      <button className="submit-button" type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Buscando voos...
          </>
        ) : (
          <>
            <span className="search-icon">🔍</span>
            Buscar voos
          </>
        )}
      </button>
    </form>
  );
};

export default DestinationForm;