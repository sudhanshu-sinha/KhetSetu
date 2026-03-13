const Rating = require('../models/Rating');
const Payment = require('../models/Payment');
const Application = require('../models/Application');

/**
 * Create a rating
 * POST /api/ratings
 */
exports.createRating = async (req, res, next) => {
  try {
    const { toUser, jobId, score, review } = req.body;

    // Verify the job application exists and is completed
    const application = await Application.findOne({
      job: jobId,
      $or: [
        { worker: req.userId },
        { worker: toUser }
      ],
      status: 'completed'
    });

    if (!application) {
      return res.status(400).json({ error: 'Can only rate after job completion' });
    }

    const rating = new Rating({
      fromUser: req.userId,
      toUser,
      job: jobId,
      score,
      review
    });
    await rating.save();

    res.status(201).json({ success: true, rating });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already rated this user for this job' });
    }
    next(error);
  }
};

/**
 * Get ratings for a user
 * GET /api/ratings/user/:userId
 */
exports.getUserRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.userId })
      .populate('fromUser', 'name profilePhoto role')
      .populate('job', 'title category')
      .sort({ createdAt: -1 });

    res.json({ success: true, ratings });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a payment record
 * POST /api/payments
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { jobId, toUser, amount, method, upiTransactionId, notes } = req.body;

    const payment = new Payment({
      job: jobId,
      fromUser: req.userId,
      toUser,
      amount,
      method,
      upiTransactionId,
      notes,
      status: method === 'cash' ? 'completed' : 'pending'
    });
    await payment.save();

    // Notify the worker
    const io = req.app.get('io');
    if (io) {
      io.to(toUser).emit('payment-received', {
        paymentId: payment._id,
        amount,
        method
      });
    }

    res.status(201).json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment history
 * GET /api/payments
 */
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      $or: [{ fromUser: req.userId }, { toUser: req.userId }]
    })
      .populate('job', 'title category')
      .populate('fromUser', 'name phone')
      .populate('toUser', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payment status
 * PUT /api/payments/:id/status
 */
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.fromUser.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    payment.status = status;
    await payment.save();
    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};
