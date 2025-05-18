// src/services/amadeusApiService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tokenPath = path.join(__dirname, '../cache/token.json');

async function getAmadeusAccessToken() {
  try {
    // Verifica cache
    if (fs.existsSync(tokenPath)) {
      const { token, expiresAt } = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
      if (new Date() < new Date(expiresAt)) {
        return token;
      }
    }

    // Faz nova requisição de token
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 1800;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    fs.writeFileSync(tokenPath, JSON.stringify({ token, expiresAt }, null, 2), 'utf-8');

    return token;
  } catch (error) {
    console.error('Erro ao obter token da Amadeus:', error.response?.data || error.message);
    throw new Error('Falha ao autenticar com a Amadeus API');
  }
}

module.exports = {
  getAmadeusAccessToken,
};
