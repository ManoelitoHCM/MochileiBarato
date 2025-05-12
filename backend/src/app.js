// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const destinationsRouter = require('./routes/destinationsRoutes');
const cityRoutes = require('./routes/cityRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/destinations', destinationsRouter);
app.use('/api/cities', cityRoutes);

module.exports = app;