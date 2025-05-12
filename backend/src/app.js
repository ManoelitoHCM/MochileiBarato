// app.js
const express = require('express');
const cors = require('cors');
const destinationsRouter = require('./routes/destinationsRoutes');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/destinations', destinationsRouter);

module.exports = app;