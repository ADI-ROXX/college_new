// backend/routes/images.js
const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/:imageName', (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, '..', 'uploads', imageName);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({ message: 'Image not found' });
    }
  });
});

module.exports = router;
