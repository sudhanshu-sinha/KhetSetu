const Dispute = require('../models/Dispute');

exports.createDispute = async (req, res, next) => {
  try {
    const { jobId, applicationId, reason } = req.body;
    const dispute = new Dispute({ job: jobId, application: applicationId, raisedBy: req.userId, reason });
    await dispute.save();
    res.status(201).json({ success: true, dispute });
  } catch (error) { next(error); }
};
