// backend/routes/bills.js
const express = require('express');
const authenticateToken = require('../middleware/auth');
const getBillModel = require('../models/DynamicBill'); // Import the dynamic model function
const Event = require('../models/Event'); // Event model
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

/**
 * @route   POST /events/:eventName/bills
 * @desc    Add a new bill to the event's collection
 * @access  Protected
 */
router.post(
  '/events/:eventName/bills',
  authenticateToken,
  upload.fields([{ name: 'images1' }, { name: 'images2' }]),
  async (req, res) => {
    const { eventName } = req.params;

    try {
      // Verify that the event exists
      const event = await Event.findOne({ name: eventName });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Get the dynamic model for the event
      const Bill = getBillModel(eventName);

      // Process uploaded files
      const images1 = req.files['images1']
        ? req.files['images1'].map((file) => file.filename)
        : [];
      const images2 = req.files['images2']
        ? req.files['images2'].map((file) => file.filename)
        : [];
      const isAvailable = req.body.isAvailable === 'true'; // Convert string to boolean

      // Create a new bill
      const newBill = new Bill({
        billName: req.body.billName,
        description: req.body.description,
        amount: req.body.amount,
        images1: images1,
        images2: images2,
        isAvailable: isAvailable, // Add this line
      });

      await newBill.save();
      res.status(201).json({ message: 'Bill added successfully' });
    } catch (error) {
      console.error('Error adding bill:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET /events/:eventName/bills
 * @desc    Get all bills for the event
 * @access  Protected
 */
router.get(
  '/events/:eventName/bills',
  authenticateToken,
  async (req, res) => {
    const { eventName } = req.params;

    try {
      // Verify that the event exists
      const event = await Event.findOne({ name: eventName });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Get the dynamic model for the event
      const Bill = getBillModel(eventName);

      // Fetch all bills for the event
      const bills = await Bill.find({});
      res.json(bills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE /events/:eventName/bills/:billId
 * @desc    Delete a bill from the event's collection
 * @access  Protected
 */
router.delete(
  '/events/:eventName/bills/:billId',
  authenticateToken,
  async (req, res) => {
    const { eventName, billId } = req.params;

    try {
      // Verify that the event exists
      const event = await Event.findOne({ name: eventName });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Get the dynamic model for the event
      const Bill = getBillModel(eventName);

      // Delete the bill
      await Bill.findByIdAndDelete(billId);
      res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
      console.error('Error deleting bill:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
