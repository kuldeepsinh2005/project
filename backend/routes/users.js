
// @route   GET /api/users/me
// @desc    Get current user
// @access  Private

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse.js');
const {asyncHandler} = require('../utils/asyncHandler');
const {registerUser, loginUser, logoutUser, loginWithRefreshToken,getCurrentUser} = require('../controllers/users');  

// @route   POST /api/users/refresh
// @desc    Login with refresh token
// @access  Public
router.post('/refresh', asyncHandler(loginWithRefreshToken));
const { verifyJWT } = require('../middleware/auth');

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.post('/logout', verifyJWT, asyncHandler(logoutUser));

router.get('/me', verifyJWT, asyncHandler(getCurrentUser));

module.exports = router;