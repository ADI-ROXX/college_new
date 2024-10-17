// backend/routes/status.js
const express = require('express');

const router = express.Router();

// GET /status
router.get('/', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = router;