// backend/models/DynamicBill.js
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    billName: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    images1: [{ type: String }],
    images2: [{ type: String }],
    isAvailable: { type: Boolean, default: false }, // Add this line

  },
  { timestamps: true }
);

// Function to get a Bill model for a specific event
module.exports = (eventName) => {
  // Sanitize the eventName to prevent injection attacks
  const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9]/g, '_');

  // Check if model already exists to prevent OverwriteModelError
  if (mongoose.models[sanitizedEventName]) {
    return mongoose.model(sanitizedEventName);
  } else {
    return mongoose.model(sanitizedEventName, billSchema, sanitizedEventName);
  }
};
