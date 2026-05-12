require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const monitorRoutes = require('./routes/monitorRoutes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.type('text').send('OK');
});

app.use('/api/monitors', monitorRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found.'
    }
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    error: {
      message: statusCode === 500 ? 'Internal server error.' : error.message
    }
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json(payload);
});

module.exports = app;
