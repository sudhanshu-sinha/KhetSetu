const Job = require('../models/Job');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');

// Dashboard analytics
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const isFarmer = req.user.role === 'farmer';

    // Job stats
    const jobQuery = isFarmer ? { postedBy: userId } : {};
    const totalJobs = await Job.countDocuments(jobQuery);
    const completedJobs = await Job.countDocuments({ ...jobQuery, status: 'completed' });
    const openJobs = await Job.countDocuments({ ...jobQuery, status: 'open' });

    // Application stats
    const appQuery = isFarmer
      ? { job: { $in: await Job.find({ postedBy: userId }).distinct('_id') } }
      : { worker: userId };
    const totalApps = await Application.countDocuments(appQuery);
    const acceptedApps = await Application.countDocuments({ ...appQuery, status: 'accepted' });

    // Monthly earnings (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const monthlyEarnings = await Payment.aggregate([
      { $match: {
        [isFarmer ? 'fromUser' : 'toUser']: userId,
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo }
      }},
      { $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$amount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Top categories
    const topCategories = await Job.aggregate([
      { $match: jobQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Average rating
    const ratingsAgg = await Rating.aggregate([
      { $match: { toUser: userId } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);

    const totalEarnings = monthlyEarnings.reduce((s, m) => s + m.total, 0);
    const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

    res.json({
      analytics: {
        totalJobs, completedJobs, openJobs,
        totalApplications: totalApps,
        acceptedApplications: acceptedApps,
        totalEarnings,
        successRate,
        averageRating: ratingsAgg[0]?.avg || 0,
        totalRatings: ratingsAgg[0]?.count || 0,
        monthlyEarnings: monthlyEarnings.map(m => ({ month: m._id, amount: m.total })),
        topCategories: topCategories.map(c => ({ category: c._id, count: c.count })),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const User = require('../models/User');
    const { role = 'worker', limit = 20 } = req.query;

    const users = await User.find({ role, isProfileComplete: true })
      .sort({ averageRating: -1, totalJobsCompleted: -1 })
      .limit(parseInt(limit))
      .select('name role averageRating totalJobsCompleted location.district skills');

    res.json({
      leaderboard: users.map((u, i) => ({
        rank: i + 1,
        _id: u._id,
        name: u.name,
        role: u.role,
        rating: u.averageRating,
        jobsCompleted: u.totalJobsCompleted,
        district: u.location?.district,
        skills: u.skills,
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
