// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeWithSearch from './components/HomeWithSearch';
import ResultsPageTraditional from './pages/ResultsPageTraditional';
import ResultsPageSuggestion from './pages/ResultsPageSuggestion';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomeWithSearch
              setResults={setResults}
              loading={loading}
              setLoading={setLoading}
            />
          }
        />
        <Route
          path="/results-traditional"
          element={
            <ResultsPageTraditional results={results} loading={loading} />
          }
        />
        <Route
          path="/results-suggestion"
          element={
            <ResultsPageSuggestion results={results} loading={loading} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
