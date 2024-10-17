// backend/routes/download.js
const express = require('express');
const authenticateToken = require('../middleware/auth');
const Event = require('../models/Event');
const Bill = require('../models/DynamicBill');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * @route   GET /download/:eventName
 * @desc    Downloads a PDF containing all bills and images for the specified event
 * @access  Protected (Requires JWT Authentication)
 */
router.get('/:eventName', authenticateToken, async (req, res) => {
  const { eventName } = req.params;

  try {
    // Fetch the event by name
    const event = await Event.findOne({ name: eventName });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Only admin or event creator can download
    if (req.user.role !== 'admin' && event.createdBy !== req.user.username) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch all bills associated with the event
    const bills = await Bill.find({ eventName });

    // Initialize PDF document
    const doc = new PDFDocument();
    
    // Set response headers to prompt file download
    res.setHeader('Content-Disposition', `attachment; filename="${eventName}_bills.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe PDF data to response
    doc.pipe(res);

    // Add Event Title
    doc
      .fontSize(20)
      .text(`Event: ${eventName}`, { align: 'center' })
      .moveDown();

    // Iterate through each bill and add details to PDF
    bills.forEach((bill, index) => {
      doc
        .fontSize(16)
        .text(`Bill ${index + 1}: ${bill.billName}`, { underline: true })
        .fontSize(12)
        .text(`Description: ${bill.description}`)
        .text(`Amount: $${bill.amount}`)
        .moveDown();

      // Add Images from images1 array
      if (bill.images1 && bill.images1.length > 0) {
        doc.fontSize(14).text('Images 1:', { underline: true });
        bill.images1.forEach((imageName) => {
          const imagePath = path.join(__dirname, '..', 'uploads', imageName);
          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, { width: 300 }).moveDown();
          } else {
            doc.text(`Image not found: ${imageName}`).moveDown();
          }
        });
      }

      // Add Images from images2 array
      if (bill.images2 && bill.images2.length > 0) {
        doc.fontSize(14).text('Images 2:', { underline: true });
        bill.images2.forEach((imageName) => {
          const imagePath = path.join(__dirname, '..', 'uploads', imageName);
          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, { width: 300 }).moveDown();
          } else {
            doc.text(`Image not found: ${imageName}`).moveDown();
          }
        });
      }

      doc.addPage(); // Add a new page for the next bill
    });

    // Finalize PDF and end the stream
    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Server error while generating PDF' });
  }
});

module.exports = router;
