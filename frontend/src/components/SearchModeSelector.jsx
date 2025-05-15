import React, { useState } from 'react';
import DestinationForm from './DestinationForm';
import SuggestionForm from './SuggestionForm';

const SearchModeSelector = ({ onSearch, loading }) => {
  const [mode, setMode] = useState('traditional');

  return (
    <div className="mb-4">
      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="modeToggle"
          checked={mode === 'suggestion'}
          onChange={() => setMode(mode === 'traditional' ? 'suggestion' : 'traditional')}
        />
        <label className="form-check-label" htmlFor="modeToggle">
          {mode === 'suggestion' ? 'Sugestor de destinos' : 'Busca tradicional'}
        </label>
      </div>

      {mode === 'traditional' ? (
        <DestinationForm onSearch={onSearch} loading={loading} />
      ) : (
        <SuggestionForm onSearch={onSearch} loading={loading} />
      )}
    </div>
  );
};

export default SearchModeSelector;
