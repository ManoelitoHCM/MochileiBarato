// src/components/SearchModeSelector.jsx
import React, { useState } from 'react';
import DestinationForm from './DestinationForm';
import SuggestionForm from './SuggestionForm';
import '../css/SearchModeSelector.css';

const SearchModeSelector = ({ onSearch, loading }) => {
  const [mode, setMode] = useState('traditional');

  return (
    <div className="mb-4">
      <div className="toggle-mode-container">
        <button
          type="button"
          className="toggle-mode-button"
          onClick={() => setMode(mode === 'traditional' ? 'suggestion' : 'traditional')}
        >
          {mode === 'suggestion' ? '🔁 Voltar para busca tradicional' : '🎯 Modo sugestor de destinos'}
        </button>
      </div>

      {mode === 'traditional' ? (
        <DestinationForm onSearch={(filters) => onSearch({ ...filters, searchMode: 'traditional' })} loading={loading} />
      ) : (
        <SuggestionForm onSearch={(filters) => onSearch({ ...filters, searchMode: 'suggestion' })} loading={loading} />
      )}
    </div>
  );
};

export default SearchModeSelector;
