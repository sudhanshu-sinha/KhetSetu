const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'INR' },
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: String,
    reference: String, // Razorpay payment id or internal ref
    method: { type: String, enum: ['razorpay', 'upi', 'cash', 'internal', 'referral'], default: 'internal' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    createdAt: { type: Date, default: Date.now }
  }],
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, enum: ['free', 'silver', 'gold'], default: 'free' },
  premiumExpiry: Date,
}, { timestamps: true });

walletSchema.index({ userId: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
