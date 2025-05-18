// CityAutocomplete.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CityInput.css';

function CityAutocomplete({ onSelect, placeholder }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (input.length >= 2) {
        axios.get(`/api/cities/search?q=${encodeURIComponent(input)}`)
          .then(res => setSuggestions(res.data))
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [input]);

  const handleSelect = (city) => {
    if (city.disabled) return; // Impede seleção de entradas inválidas
    onSelect(city);
    setInput(`${city.name} (${city.iataCode})`);
    setSuggestions([]);
  };

  return (
    <div className="modern-autocomplete">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setTimeout(() => setIsActive(false), 200)}
        placeholder={placeholder}
        className="autocomplete-input"
      />

      {isActive && suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((city, idx) => (
            <div
              key={city.iataCode || `no-code-${idx}`}
              className={`suggestion-item ${city.disabled ? 'disabled' : ''}`}
              onClick={() => handleSelect(city)}
            >
              <div className="city-info">
                <span className="city-name">{city.name}</span>
                {city.iataCode && (
                  <span className="airport-code">{city.iataCode}</span>
                )}
              </div>
              {city.country && (
                <span className="country-badge">{city.country}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;
