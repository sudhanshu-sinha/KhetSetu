const mongoose = require('mongoose');
const loanSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  purpose: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'repaid'], default: 'pending' },
  interestRate: { type: Number, default: 12 }
}, { timestamps: true });
module.exports = mongoose.model('Loan', loanSchema);
