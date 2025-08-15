
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
// /**
//  * @desc    Get all users
//  * @route   GET /api/users
//  * @access  Private/Admin
//  */
// router.get(
//   '/',
//   asyncHandler(async (req, res, next) => {
//     const users = await User.find().select('-password');
//     res.status(200).json({
//       success: true,
//       count: users.length,
//       data: users
//     });
//   })
// );

// /**
//  * @desc    Get single user
//  * @route   GET /api/users/:id
//  * @access  Private/Admin
//  */
// router.get(
//   '/:id',
//   asyncHandler(async (req, res, next) => {
//     const user = await User.findById(req.params.id).select('-password');

//     if (!user) {
//       return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: user
//     });
//   })
// );

// /**
//  * @desc    Create user
//  * @route   POST /api/users
//  * @access  Private/Admin
//  */
// router.post(
//   '/',
//   asyncHandler(async (req, res, next) => {
//     const user = await User.create(req.body);

//     res.status(201).json({
//       success: true,
//       data: user
//     });
//   })
// );

// /**
//  * @desc    Update user
//  * @route   PUT /api/users/:id
//  * @access  Private/Admin
//  */
// router.put(
//   '/:id',
//   asyncHandler(async (req, res, next) => {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     }).select('-password');

//     if (!user) {
//       return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: user
//     });
//   })
// );

// /**
//  * @desc    Delete user
//  * @route   DELETE /api/users/:id
//  * @access  Private/Admin
//  */
// router.delete(
//   '/:id',
//   asyncHandler(async (req, res, next) => {
//     const user = await User.findByIdAndDelete(req.params.id);

//     if (!user) {
//       return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
//     }

//     res.status(200).json({
//       success: true,
//       data: {}
//     });
//   })
// );

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.post('/logout', verifyJWT, asyncHandler(logoutUser));

router.get('/me', verifyJWT, asyncHandler(getCurrentUser));

module.exports = router;