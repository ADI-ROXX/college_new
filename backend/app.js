// backend/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const billRoutes = require('./routes/bills');
const imageRoutes = require('./routes/images');
const downloadRoutes = require('./routes/download'); // Import the download route
const statusRoutes = require('./routes/status');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', billRoutes);
app.use('/download', downloadRoutes); // Use the download route
app.use('/status', statusRoutes);
app.use('/getImage', imageRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
  })
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5080;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
