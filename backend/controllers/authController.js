const User = require('../models/User');
const { generateOTP, hashOTP, verifyOTP, sendOTP } = require('../utils/otp');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
exports.sendOtpHandler = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
    }

    // Generate OTP
    let otp;
    if (process.env.NODE_ENV === 'development') {
      otp = '123456';
    } else {
      otp = generateOTP();
    }

    // Hash and store OTP with 5-minute expiry
    const hashedOTP = await hashOTP(otp);
    user.otp = {
      code: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };
    await user.save();

    // Send OTP
    await sendOTP(phone, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { devOTP: '123456' })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and login
 * POST /api/auth/verify-otp
 */
exports.verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Dev mode: accept 123456
    let isValid = false;
    if (process.env.NODE_ENV === 'development' && otp === '123456') {
      isValid = true;
    } else {
      isValid = await verifyOTP(otp, user.otp.code);
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Clear OTP
    user.otp = undefined;

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: user.toJSON(),
      isNewUser: !user.isProfileComplete
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
exports.refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, role, location, skills } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (role && !user.role) user.role = role; // Role can only be set once
    if (location) {
      if (location.coordinates) {
        user.location.type = 'Point';
        user.location.coordinates = location.coordinates;
      }
      if (location.district) user.location.district = location.district;
      if (location.village) user.location.village = location.village;
      if (location.pincode) user.location.pincode = location.pincode;
      if (location.state) user.location.state = location.state;
    }
    if (skills && user.role === 'worker') {
      user.skills = skills;
    }

    // Check if profile is complete
    if (user.name && user.role && user.location.district) {
      user.isProfileComplete = true;
    }

    await user.save();
    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

/**
 * Logout - invalidate refresh token
 * POST /api/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
