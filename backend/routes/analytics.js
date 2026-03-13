const router = require('express').Router();
const { auth } = require('../middleware/auth');
const analyticsCtrl = require('../controllers/analyticsController');

router.use(auth);

router.get('/dashboard', analyticsCtrl.getDashboard);
router.get('/leaderboard', analyticsCtrl.getLeaderboard);

module.exports = router;
