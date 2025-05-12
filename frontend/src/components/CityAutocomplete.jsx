import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CityAutocomplete({ onSelect }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (input.length >= 2) {
      console.log('Buscando por:', input); // 👈 log para debug
      axios
        .get(`/api/cities/search?q=${encodeURIComponent(input)}`)
        .then(res => {
          console.log('Resultados:', res.data); // 👈 log resposta
          setSuggestions(res.data);
        })
        .catch(err => {
          console.error('Erro na busca:', err);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, 300);

    return () => clearTimeout(delayDebounce);
  }, [input]);

  return (
    <div className="mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="Digite a cidade de origem"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="list-group">
          {suggestions.map((city, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action"
              onClick={() => {
                onSelect(city);
                setInput(`${city.name} (${city.iataCode})`);
                setSuggestions([]);
              }}
              style={{ cursor: 'pointer' }}
            >
              {city.name} ({city.iataCode})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CityAutocomplete;
