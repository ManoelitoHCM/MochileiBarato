// src/components/SuggestionForm.jsx
import React, { useState } from 'react';
import CityAutocomplete from './CityAutocomplete';
import '../css/DestinationForm.css';
import '../css/CityInput.css';

const SuggestionForm = ({ onSearch, loading }) => {
  const [origin, setOrigin] = useState('');
  const [originLabel, setOriginLabel] = useState('');
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
      destination: null, // sugestão não define destino
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : null,
      tripType,
      budget: Number(budget),
      originLabel
    });
  };

  return (
    <form onSubmit={handleSubmit} className="destination-form">
      <div className="form-group">
        <label className="form-label">
          <span className="form-icon">📍</span>
          Cidade de origem
        </label>
        <div className="city-input-container">
          <CityAutocomplete
            onSelect={(city) => {
              setOrigin(city.cityCode || city.iataCode); 
              setOriginLabel(`${city.name} (${city.cityCode || city.iataCode})`);
            }}
            placeholder="Ex: Fortaleza (FOR)"
          />
        </div>
      </div>

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
            Buscando sugestões...
          </>
        ) : (
          <>
            <span className="search-icon">🔍</span>
            Buscar destinos
          </>
        )}
      </button>
    </form>
  );
};

export default SuggestionForm;
