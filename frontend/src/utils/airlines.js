// utils/airlines.js
const airlineMap = {
  G3: 'Gol Linhas Aéreas',
  AD: 'Azul Linhas Aéreas',
  JJ: 'LATAM Airlines',
  LA: 'LATAM Airlines',
  CM: 'Copa Airlines',
  AA: 'American Airlines',
  TP: 'TAP Air Portugal',
  // Adicione conforme necessário
};

export const formatAirline = (code) =>
  airlineMap[code] ? `${airlineMap[code]} (${code})` : code;
