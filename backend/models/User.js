// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
  username: { type: String, trim: true, required: true, unique: true, index: true },
  email: { type: String, trim: true, lowercase: true, required: true, unique: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String, trim: true, default: '' },
  lastName: { type: String, trim: true, default: '' },
  profileImage: { type: String, default: '' },
  roles: { type: [String], default: ['User'] }, // e.g. Admin, User, Researcher
  refreshToken: { type: String, default: null }, // stored refresh token (if you want server-side invalidation)
}, {
  timestamps: true
});

// Remove sensitive fields when converting to JSON
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  }
});

// Hash password before save (only if modified)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Instance method: compare raw password with hashed
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Instance method: generate access token
UserSchema.methods.generateAccessToken = function () {
  const payload = { _id: this._id, username: this.username, roles: this.roles };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' });
};

// Instance method: generate refresh token
UserSchema.methods.generateRefreshToken = function () {
  const payload = { _id: this._id };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d' });
};

module.exports = mongoose.model('User', UserSchema);



// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require("jsonwebtoken");
// const UserSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: [true, 'Please provide a username'],
//     unique: true,
//     index: true,
//     trim: true,
//     minlength: [3, 'Username must be at least 3 characters long'],
//     maxlength: [20, 'Username cannot exceed 20 characters'],
//     match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
//   },
//   email: {
//     type: String,
//     required: [true, 'Please provide an email'],
//     unique: true,
//     index: true,
//     lowercase: true,
//     trim: true,
//     match: [
//       /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//       'Please provide a valid email'
//     ]
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: [8, 'Password must be at least 8 characters long'],
//     select: false
//   },
//   refreshToken: {
//     type: String
//   },
//   firstName: {
//     type: String,
//     required: [true, 'Please provide your first name'],
//     trim: true,
//     maxlength: [50, 'First name cannot exceed 50 characters']
//   },
//   lastName: {
//     type: String,
//     required: [true, 'Please provide your last name'],
//     trim: true,
//     maxlength: [50, 'Last name cannot exceed 50 characters']
//   },
//   profileImage: {
//     type: String,
//     default: 'https://randomuser.me/api/portraits/lego/1.jpg',
//     validate: {
//       validator: function(v) {
//         return /^https?:\/\/.+/.test(v);
//       },
//       message: 'Profile image must be a valid URL'
//     }
//   },
//   status: {
//     type: String,
//     enum: ['online', 'offline', 'busy', 'away'],
//     default: 'offline'
//   },
//   lastSeen: {
//     type: Date,
//     default: Date.now
//   },
//   preferences: {
//     notifications: {
//       email: { type: Boolean, default: true },
//       push: { type: Boolean, default: true },
//       meetingReminders: { type: Boolean, default: true }
//     },
//     privacy: {
//       showOnlineStatus: { type: Boolean, default: true },
//       allowDirectMessages: { type: Boolean, default: true }
//     },
//     video: {
//       defaultCamera: { type: String, default: 'default' },
//       defaultMicrophone: { type: String, default: 'default' },
//       autoJoinWithVideo: { type: Boolean, default: false },
//       autoJoinWithAudio: { type: Boolean, default: true }
//     }
//   },
//   subscription: {
//     plan: {
//       type: String,
//       enum: ['free', 'basic', 'premium', 'enterprise'],
//       default: 'free'
//     },
//     features: {
//       maxParticipants: { type: Number, default: 10 },
//       maxMeetingDuration: { type: Number, default: 40 }, // minutes
//       recordingEnabled: { type: Boolean, default: false },
//       screenSharingEnabled: { type: Boolean, default: true },
//       customBranding: { type: Boolean, default: false }
//     },
//     validUntil: { type: Date }
//   },
//   isEmailVerified: {
//     type: Boolean,
//     default: false
//   },
//   emailVerificationToken: String,
//   emailVerificationExpires: Date,
//   passwordResetToken: String,
//   passwordResetExpires: Date,
//   loginAttempts: {
//     type: Number,
//     default: 0
//   },
//   lockUntil: Date,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Virtual for full name
// UserSchema.virtual('fullName').get(function() {
//   return `${this.firstName} ${this.lastName}`;
// });

// // Virtual for isLocked
// UserSchema.virtual('isLocked').get(function() {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// // Indexes for better query performance
// // UserSchema.index({ status: 1 });
// // UserSchema.index({ 'subscription.plan': 1 });
// // UserSchema.index({ createdAt: -1 });

// // Hash password before saving
// UserSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Update updatedAt timestamp
// UserSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// // Method to compare passwords
// UserSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Method to increment login attempts
// // UserSchema.methods.incLoginAttempts = async function() {
// //   // If we have a previous lock that has expired, restart at 1
// //   if (this.lockUntil && this.lockUntil < Date.now()) {
// //     return await this.updateOne({
// //       $unset: { lockUntil: 1 },
// //       $set: { loginAttempts: 1 }
// //     });
// //   }
  
// //   const updates = { $inc: { loginAttempts: 1 } };
  
// //   // Lock account after 5 failed attempts
// //   if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
// //     updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
// //   }
  
// //   return await this.updateOne(updates);
// // };

// // // Method to reset login attempts
// // UserSchema.methods.resetLoginAttempts = async function() {
// //   return await this.updateOne({
// //     $unset: { loginAttempts: 1, lockUntil: 1 }
// //   });
// // };

// // // Method to generate email verification token
// // UserSchema.methods.generateEmailVerificationToken = function() {
// //   const token = require('crypto').randomBytes(32).toString('hex');
// //   this.emailVerificationToken = token;
// //   this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
// //   return token;
// // };

// // // Method to generate password reset token
// // UserSchema.methods.generatePasswordResetToken = function() {
// //   const token = require('crypto').randomBytes(32).toString('hex');
// //   this.passwordResetToken = token;
// //   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
// //   return token;
// // };

// UserSchema.methods.generateAccessToken = function(){
//     return jwt.sign(
//         {
//             _id: this._id,
//             email: this.email,
//             username: this.username,
      
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// }
// UserSchema.methods.generateRefreshToken = function(){
//     return jwt.sign(
//         {
//             _id: this._id,
            
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }


// module.exports = mongoose.model('User', UserSchema);