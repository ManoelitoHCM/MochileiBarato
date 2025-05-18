// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeWithSearch from './components/HomeWithSearch';
import ResultsPage from './pages/ResultsPage';

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
          path="/resultados"
          element={<ResultsPage results={results} loading={loading} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
