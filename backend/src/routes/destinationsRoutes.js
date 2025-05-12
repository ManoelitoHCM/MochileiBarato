// backend/src/routes/destinations.routes.js
const express = require('express');
const router = express.Router();
const DestinationsController = require('../controllers/destinationsController');
const validateDestination = require('../middlewares/validateDestination');

// Rota POST: /api/destinations
router.post('/', validateDestination, async (req, res) => {
  const { origin, month, budget, destination } = req.body;

  try {
    const results = await DestinationsController.searchDestinations(origin, month, budget, destination);
    res.json(results); // <-- corrigido aqui
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
