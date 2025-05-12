import React, { useState } from 'react';

const DestinationForm = ({ onSearch }) => {
  const [origin, setOrigin] = useState('');
  const [month, setMonth] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ origin, month, budget: Number(budget) });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <label className="form-label">Cidade de origem</label>
        <input className="form-control" type="text" value={origin} onChange={e => setOrigin(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Mês da viagem</label>
        <select className="form-select" value={month} onChange={e => setMonth(e.target.value)} required>
          <option value="">Selecione um mês</option>
          {[
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
          ].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Orçamento máximo (R$)</label>
        <input className="form-control" type="number" value={budget} onChange={e => setBudget(e.target.value)} required />
      </div>
      <button className="btn btn-primary w-100" type="submit">Buscar destinos</button>
    </form>
  );
};

export default DestinationForm;
