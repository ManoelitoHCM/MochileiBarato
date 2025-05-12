import React from 'react';

const DestinationList = ({ destinations }) => {
  if (destinations.length === 0) {
    return <div className="alert alert-info">Nenhum destino encontrado.</div>;
  }

  return (
    <div className="row">
      {destinations.map(dest => (
        <div key={dest.id} className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">{dest.name}</h5>
              <p className="card-text">
                <strong>Preço:</strong> R$ {dest.price}<br />
                <strong>Duração do voo:</strong> {dest.flightDuration}<br />
                <strong>Atrações:</strong> {dest.attractions.join(', ')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DestinationList;
