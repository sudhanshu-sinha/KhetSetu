const router = require('express').Router();
const { auth } = require('../middleware/auth');
const walletCtrl = require('../controllers/walletController');

router.use(auth);

router.get('/', walletCtrl.getWallet);
router.post('/add-funds', walletCtrl.addFunds);
router.post('/withdraw', walletCtrl.withdraw);
router.post('/subscribe', walletCtrl.subscribePremium);
router.get('/transactions', walletCtrl.getTransactions);

module.exports = router;
