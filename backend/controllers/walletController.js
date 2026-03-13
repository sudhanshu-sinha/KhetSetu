const Wallet = require('../models/Wallet');

// Get or create wallet
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id });
    }
    res.json({
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
        isPremium: wallet.isPremium,
        premiumPlan: wallet.premiumPlan,
        premiumExpiry: wallet.premiumExpiry,
        transactions: wallet.transactions.slice(-20).reverse(),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add funds (simulate Razorpay verification)
exports.addFunds = async (req, res) => {
  try {
    const { amount, paymentId, method = 'razorpay' } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // In production: verify payment with Razorpay
    // const razorpay = new Razorpay({ key_id, key_secret });
    // await razorpay.payments.fetch(paymentId);

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user._id });

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit', amount, description: 'Funds added', reference: paymentId || 'manual', method
    });
    await wallet.save();

    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Withdraw funds
exports.withdraw = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit', amount, description: `Withdraw to ${upiId || 'bank'}`, method: 'upi'
    });
    await wallet.save();

    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Subscribe to premium
exports.subscribePremium = async (req, res) => {
  try {
    const { plan, paymentId } = req.body;
    const prices = { silver: 99, gold: 299 };
    const price = prices[plan];
    if (!price) return res.status(400).json({ error: 'Invalid plan' });

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user._id });

    // Deduct from wallet or accept payment
    if (wallet.balance >= price) {
      wallet.balance -= price;
      wallet.transactions.push({
        type: 'debit', amount: price, description: `${plan.toUpperCase()} Premium subscription`, method: 'internal'
      });
    }

    wallet.isPremium = true;
    wallet.premiumPlan = plan;
    wallet.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await wallet.save();

    res.json({ success: true, premiumPlan: plan, premiumExpiry: wallet.premiumExpiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Transaction history
exports.getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return res.json({ transactions: [] });

    const { type, page = 1, limit = 20 } = req.query;
    let txns = wallet.transactions;
    if (type) txns = txns.filter(t => t.type === type);

    txns.sort((a, b) => b.createdAt - a.createdAt);
    const paginated = txns.slice((page - 1) * limit, page * limit);

    res.json({ transactions: paginated, total: txns.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
