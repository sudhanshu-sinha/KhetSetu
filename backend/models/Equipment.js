const mongoose = require('mongoose');
const equipmentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  pricePerDay: { type: Number, required: true },
  category: { type: String, enum: ['tractor', 'harvester', 'pump', 'tools', 'other'], default: 'other' },
  location: { village: String, district: String },
  available: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Equipment', equipmentSchema);
