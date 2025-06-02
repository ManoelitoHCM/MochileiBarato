// backend/src/routes/destinationsRoutes.js
const express = require('express');
const router = express.Router();
const DestinationsController = require('../controllers/destinationsController');

router.post('/', async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      tripType,
      budget,
      maxResults
    } = req.body;


    const results = await DestinationsController.searchDestinations(
      origin,
      departureDate,
      budget,
      destination,
      returnDate,
      tripType
    );

    res.json(results);
  } catch (error) {
    console.error('❌ Erro ao buscar destinos:', error);
    res.status(500).json({ error: 'Erro ao buscar destinos.' });
  }
});

module.exports = router;
