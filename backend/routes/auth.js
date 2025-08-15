const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse.js');
const {asyncHandler} = require('../utils/asyncHandler');
const {registerUser, loginUser, logoutUser, loginWithRefreshToken,getCurrentUser} = require('../controllers/auth');  

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
router.post('/verify',asyncHandler(loginWithRefreshToken));

module.exports = router;

// // routes/auth.js
// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { validateRegisterInput, validateLoginInput } = require('../utils/validators');
// const {asyncHandler} = require('../utils/asyncHandler');
// const { protect } = require('../middleware/auth');
// const { registerUser } = require('../controllers/users');

// // @route   POST /api/auth/register
// // @desc    Register new user
// // @access  Public
// // router.post('/api/auth/register', async (req, res) => {
// //     console.log("routes/auth.js:/register");
// //   try {
// //     const { username, email, password, confirmPassword } = req.body;

// //     // Validate input
// //     const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
// //     if (!valid) {
// //       return res.status(400).json(errors);
// //     }

// //     // Check if user exists
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) {
// //       return res.status(400).json({ email: 'Email already in use' });
// //     }

// //     // Hash password
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     // Create user
// //     const newUser = new User({
// //       username,
// //       email,
// //       password: hashedPassword
// //     });

// //     const user = await newUser.save();

// //     // Create JWT token
// //     const token = jwt.sign(
// //       { id: user._id, username: user.username },
// //       process.env.JWT_SECRET,
// //       { expiresIn: '24h' }
// //     );

// //     res.status(201).json({
// //       _id: user._id,
// //       username: user.username,
// //       email: user.email,
// //       token,
// //       createdAt: user.createdAt
// //     });

// //   } catch (err) {
// //     console.error('Registration error:', err);
// //     res.status(500).json({ error: 'Registration failed. Please try again.' });
// //   }
// // });


// // routes/auth.js
// router.post('/register', asyncHandler(registerUser));

// // @route   POST /api/auth/login
// // @desc    Login user
// // @access  Public
// router.post('/login', asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   // Validate input
//   const { valid, errors } = validateLoginInput(email, password);
//   if (!valid) {
//     return res.status(400).json(errors);
//   }

//   // Check if user exists
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(404).json({ email: 'User not found' });
//   }

//   // Validate password
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return res.status(400).json({ password: 'Incorrect password' });
//   }

//   // Create JWT token
//   const token = jwt.sign(
//     { id: user._id, username: user.username },
//     process.env.JWT_SECRET,
//     { expiresIn: '24h' }
//   );

//   res.json({
//     _id: user._id,
//     username: user.username,
//     email: user.email,
//     token,
//     createdAt: user.createdAt
//   });
// }));

// // @route   POST /api/auth/refresh
// // @desc    Refresh access token
// // @access  Public
// router.post('/refresh', asyncHandler(async (req, res) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return res.status(401).json({ error: 'Refresh token is required' });
//   }

//   try {
//     // Verify refresh token
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const user = await User.findById(decoded.id).select('-password');

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid refresh token' });
//     }

//     // Generate new access token
//     const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'
//     });

//     res.json({
//       success: true,
//       accessToken: newAccessToken,
//       user
//     });
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid refresh token' });
//   }
// }));

// // @route   GET /api/auth/me
// // @desc    Get current user data
// // @access  Private
// router.get('/me', verifyJWT, asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id).select('-password');
//   res.json(user);
// }));

// module.exports = router;