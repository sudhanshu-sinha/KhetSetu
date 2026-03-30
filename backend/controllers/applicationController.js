const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendSmsFallback } = require('../utils/smsFallback');

/**
 * Apply to a job
 * POST /api/applications
 */
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId, message, selectedTeamMembers } = req.body;
    let { teamSize = 1 } = req.body;
    
    if (selectedTeamMembers && Array.isArray(selectedTeamMembers) && selectedTeamMembers.length > 0) {
      teamSize = selectedTeamMembers.length;
    }

    // Check job exists and is open
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ error: 'This job is no longer accepting applications' });

    // Can't apply to own job
    if (job.postedBy.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot apply to your own job' });
    }

    // Check for existing application
    const existing = await Application.findOne({ job: jobId, worker: req.userId });
    if (existing) return res.status(400).json({ error: 'You have already applied to this job' });

    // Block if teamSize > remaining spots
    const remainingSpots = job.workersNeeded - job.workersHired;
    if (teamSize > remainingSpots) {
      return res.status(400).json({ error: `This job only needs ${remainingSpots} more worker(s). Your team of ${teamSize} is too large.` });
    }

    const application = new Application({
      job: jobId,
      worker: req.userId,
      message,
      teamSize,
      selectedTeamMembers
    });
    await application.save();

    // Update job application count
    job.applicationsCount += 1;
    await job.save();

    // Populate worker info for the response
    await application.populate('worker', 'name phone location averageRating skills profilePhoto');

    // Emit real-time notification to farmer
    const io = req.app.get('io');
    if (io) {
      io.to(job.postedBy.toString()).emit('new-application', {
        applicationId: application._id,
        jobId: job._id,
        jobTitle: job.title,
        worker: application.worker,
        message,
        teamSize,
        selectedTeamMembers
      });
    }

    res.status(201).json({ success: true, application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }
    next(error);
  }
};

/**
 * Get applications for a specific job (farmer view)
 * GET /api/applications/job/:jobId
 */
exports.getApplicationsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify the farmer owns this job
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.postedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('worker', 'name phone location averageRating skills profilePhoto totalJobsCompleted')
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (accept/reject)
 * PUT /api/applications/:id/status
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    const application = await Application.findById(req.params.id)
      .populate('job worker');
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Verify farmer owns the job
    if (application.job.postedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = status;
    if (req.body.farmerNote) application.farmerNote = req.body.farmerNote;
    await application.save();

    // If accepted, increment workers hired
    if (status === 'accepted') {
      const incrementAmount = application.teamSize || 1;
      await Job.findByIdAndUpdate(application.job._id, {
        $inc: { workersHired: incrementAmount }
      });

      // Check if job is fully staffed
      const job = await Job.findById(application.job._id);
      if (job.workersHired >= job.workersNeeded) {
        job.status = 'in_progress';
        await job.save();
      }
    }

    // Emit notification to worker
    const io = req.app.get('io');
    const workerId = application.worker._id ? application.worker._id.toString() : application.worker.toString();
    
    if (io) {
      io.to(workerId).emit('application-update', {
        applicationId: application._id,
        jobId: application.job._id,
        jobTitle: application.job.title,
        status
      });
    }

    // Trigger SMS Fallback for critical updates
    if (status === 'accepted' && application.worker.phone) {
      const message = `KhetSetu App: Great news! Your application for "${application.job.title}" has been accepted. Please check the app to coordinate with the farmer.`;
      sendSmsFallback(application.worker.phone, message).catch(err => console.error("SMS error:", err));
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current worker's applications
 * GET /api/applications/my
 */
exports.getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { worker: req.userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const applications = await Application.find(query)
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'name phone location' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark application as completed
 * PUT /api/applications/:id/complete
 */
exports.completeApplication = async (req, res, next) => {
  try {
    const { daysWorked, amountPaid, paymentMethod, upiTransactionId, farmerNote } = req.body;
    
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (application.job.postedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only complete accepted applications' });
    }

    application.status = 'completed';
    application.daysWorked = daysWorked || application.daysWorked;
    application.amountPaid = amountPaid || application.amountPaid;
    application.paymentMethod = paymentMethod || application.paymentMethod;
    if (upiTransactionId) application.upiTransactionId = upiTransactionId;
    if (farmerNote) application.farmerNote = farmerNote;
    
    await application.save();

    // Make Payment Record if amount > 0
    if (amountPaid && amountPaid > 0) {
      const Payment = require('../models/Payment');
      const payment = new Payment({
        job: application.job._id,
        fromUser: req.userId,
        toUser: application.worker,
        amount: amountPaid,
        method: paymentMethod || 'cash',
        upiTransactionId: upiTransactionId || undefined,
        status: 'completed',
        notes: `Payout for working ${daysWorked || 0} days/units on job: ${application.job.title}`
      });
      await payment.save();
    }

    // Mark the parent job as completed ONly if all ACCEPTED or IN_PROGRESS applications are complete.
    // E.g., if there are 3 workers, we only mark job complete if all 3 are completed or cancelled.
    if (application.job && application.job.status !== 'completed') {
      const pendingApps = await Application.countDocuments({ 
        job: application.job._id, 
        status: { $in: ['accepted'] } // If there are still accepted workers who haven't finished
      });
      
      if (pendingApps === 0) {
         await Job.findByIdAndUpdate(application.job._id, { status: 'completed' });
      }
    }

    // Increment worker's completed jobs
    const User = require('../models/User');
    await User.findByIdAndUpdate(application.worker, { $inc: { totalJobsCompleted: 1 } });

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent applications across all farmer's jobs
 * GET /api/applications/farmer-recent
 */
exports.getRecentFarmerApplications = async (req, res, next) => {
  try {
    // Find all jobs posted by this farmer
    const farmerJobs = await Job.find({ postedBy: req.userId }).select('_id');
    const jobIds = farmerJobs.map(j => j._id);

    // Get recent applications for those jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('worker', 'name phone averageRating skills profilePhoto totalJobsCompleted')
      .populate('job', 'title category wageAmount wageType')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Worker withdraws application
 * DELETE /api/applications/:id
 */
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    // Auth
    if (application.worker.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (['completed', 'rejected'].includes(application.status)) {
      return res.status(400).json({ error: 'Cannot withdraw this application' });
    }

    // Adjust job counters
    if (application.status === 'accepted') {
      const decrementAmount = application.teamSize || 1;
      await Job.findByIdAndUpdate(application.job._id, {
        $inc: { workersHired: -decrementAmount }
      });
      
      const job = await Job.findById(application.job._id);
      if (job && job.workersHired < job.workersNeeded && job.status === 'in_progress') {
        job.status = 'open';
        await job.save();
      }
    } else if (application.status === 'pending') {
      await Job.findByIdAndUpdate(application.job._id, {
        $inc: { applicationsCount: -1 }
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Socket notification
    const io = req.app.get('io');
    if (io && application.job && application.job.postedBy) {
      io.to(application.job.postedBy.toString()).emit('application-withdrawn', {
        applicationId: application._id,
        jobId: application.job._id
      });
    }

    res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    next(error);
  }
};
