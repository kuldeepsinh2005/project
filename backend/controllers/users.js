// @desc    Login with refresh token
// @route   POST /api/users/refresh
// @access  Public
exports.loginWithRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    let decoded;
    try {
      decoded = require('jsonwebtoken').verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const user = await User.findById(decoded.id || decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    // Generate new access token
    const accessToken = user.generateAccessToken();
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    next(err);
  }
};
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const ErrorResponse = require('../utils/errorResponse');
const { validateRegisterInput } = require('../utils/validators');

// // Generate Access Token

// const generateAccessToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'
//   });
// };

// // Generate Refresh Token
// const generateRefreshToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
//     expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d'
//   });
// };

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ErrorResponse(404, "User not found while generating tokens");
        }
        // console.log("before generating Access tokens");
        const accessToken = user.generateAccessToken();
        // console.log("before generating Refresh tokens");
        const refreshToken = user.generateRefreshToken();
        // console.log("after generating Refresh tokens", user);
        user.refreshToken = refreshToken;
        // console.log("print User Before save", user);
        await user.save({ validateBeforeSave: false });
        // console.log("print User after save");
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ErrorResponse(500, error.message || "Something went wrong while generating referesh and access token");
    }
}

exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password,firstName,lastName } = req.body;

    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
      return res.status(400).json({ error: 'Email or Username already in use' });
    }

    // Create user (password hashing should be in your User model)
    const user = await User.create({ username, email, password,firstName,lastName });

    // Generate tokens using User model instance methods
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days
    });

    // Respond
    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    // Compare password (assuming user.comparePassword exists)
    // console.log("before comparing password",user);
     // console.log(user
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({
      success: true,
      loggedInUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  try {
  await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};