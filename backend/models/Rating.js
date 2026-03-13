const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// One rating per user per job
ratingSchema.index({ fromUser: 1, toUser: 1, job: 1 }, { unique: true });
ratingSchema.index({ toUser: 1 });

// After saving a rating, update the user's average rating
ratingSchema.post('save', async function() {
  const Rating = this.constructor;
  const User = mongoose.model('User');

  const stats = await Rating.aggregate([
    { $match: { toUser: this.toUser } },
    { $group: { _id: '$toUser', avg: { $avg: '$score' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.toUser, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      totalRatings: stats[0].count
    });
  }
});

module.exports = mongoose.model('Rating', ratingSchema);
