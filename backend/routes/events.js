// backend/routes/events.js
const express = require('express');
const authenticateToken = require('../middleware/auth');
const Event = require('../models/Event');
const getBillModel = require('../models/DynamicBill'); // Import the dynamic model function

const router = express.Router();
/**
 * @route   GET /events
 * @desc    Get all events
 * @access  Protected
 */
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
/**
 * @route   POST /add_event
 * @desc    Create a new event
 * @access  Protected
 */
router.post('/add_event', authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    // Check if the event already exists
    const existingEvent = await Event.findOne({ name });
    if (existingEvent) {
      return res.status(400).json({ message: 'Event already exists' });
    }

    // Create a new event
    const newEvent = new Event({
      name,
      createdBy: req.user.username,
    });

    await newEvent.save();

    // Initialize the bills collection for the event
    const Bill = getBillModel(name);
    // Create an empty document to initialize the collection
    const tempBill = new Bill({billName:"temp",
      description: "temp",
      amount: 4 ,});
    await tempBill.save();
    await Bill.deleteMany({}); // Clean up the temporary document

    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
