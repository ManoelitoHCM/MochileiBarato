// backend/src/routes/suggestionsRoutes.js
const express = require('express');
const router = express.Router();
const SuggestionController = require('../controllers/suggestionController');

router.post('/', SuggestionController.getSuggestions);

module.exports = router;
