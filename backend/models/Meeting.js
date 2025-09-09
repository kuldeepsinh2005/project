// // backend/models/Meeting.js

const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    leavedAt: { type: Date }, // New field to track when a user leaves
  },
  { _id: false }
);

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, index: true }, // unique code
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [ParticipantSchema],
  status: { type: String, enum: ['scheduled','live','ended'], default: 'live' },
  endedAt: { type: Date },
}, { timestamps: true });


// Remove internal fields when converting to JSON
MeetingSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Meeting', MeetingSchema);


// const mongoose = require('mongoose');

// const ParticipantSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     joinedAt: { type: Date, default: Date.now },
//   },
//   { _id: false }
// );

// const MeetingSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   code: { type: String, required: true, unique: true, index: true }, // unique code
//   host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   participants: [ParticipantSchema],
//   status: { type: String, enum: ['scheduled','live','ended'], default: 'live' },
//   endedAt: { type: Date },
// }, { timestamps: true });


// // Remove internal fields when converting to JSON
// MeetingSchema.set('toJSON', {
//   transform: function (doc, ret) {
//     delete ret.__v;
//     return ret;
//   },
// });

// module.exports = mongoose.model('Meeting', MeetingSchema);


// const mongoose = require('mongoose');
// const { customAlphabet } = require('nanoid');

// // Alphanumeric uppercase code, length 8
// const nano = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// const ParticipantSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
//   username: { type: String, default: '' },
//   role: { type: String, enum: ['host', 'participant', 'guest'], default: 'participant' },
//   joinedAt: { type: Date, default: Date.now }
// }, { _id: false });

// const MeetingSchema = new mongoose.Schema({
//   meetingId: { type: String, required: true, unique: true, index: true },
//   host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
//   title: { type: String, default: '' },
//   participants: { type: [ParticipantSchema], default: [] },
//   isLocked: { type: Boolean, default: false },
//   passcodeHash: { type: String, default: null }, // optional if you support passcodes (hash it)
//   startedAt: { type: Date },
//   endedAt: { type: Date },
//   meta: { type: mongoose.Schema.Types.Mixed, default: {} }
// }, {
//   timestamps: true
// });

// // Virtual for participant count
// MeetingSchema.virtual('participantCount').get(function () {
//   return this.participants?.length || 0;
// });

// // Static helper to create meeting with unique meetingId
// MeetingSchema.statics.generateUniqueMeetingId = async function (tries = 5) {
//   for (let i = 0; i < tries; i++) {
//     const code = nano();
//     // eslint-disable-next-line no-await-in-loop
//     const exists = await this.findOne({ meetingId: code }).lean().exec();
//     if (!exists) return code;
//   }
//   throw new Error('Could not generate unique meeting id');
// };

// // Instance helpers to add/remove participants
// MeetingSchema.methods.addParticipant = function ({ userId, username, role = 'participant' }) {
//   const exists = this.participants.some(p => p.user && p.user.equals(userId));
//   if (!exists) {
//     this.participants.push({ user: userId, username, role });
//   }
//   return this.save();
// };

// MeetingSchema.methods.removeParticipantBySocketOrUser = function ({ userId, username }) {
//   this.participants = this.participants.filter(p => {
//     if (userId && p.user) return !p.user.equals(userId);
//     if (username) return p.username !== username;
//     return true;
//   });
//   return this.save();
// };

// module.exports = mongoose.model('Meeting', MeetingSchema);


// // // backend/models/Meeting.js
// // const mongoose = require('mongoose');

// // const ParticipantSchema = new mongoose.Schema({
// //   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   username: { type: String },
// //   joinedAt: { type: Date, default: Date.now }
// // });

// // const MeetingSchema = new mongoose.Schema({
// //   meetingId: { type: String, required: true, unique: true },
// //   host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   title: { type: String, default: '' },
// //   participants: [ParticipantSchema],
// //   createdAt: { type: Date, default: Date.now },
// //   meta: { type: mongoose.Schema.Types.Mixed } // store any extra options
// // });

// // module.exports = mongoose.model('Meeting', MeetingSchema);


// // const mongoose = require('mongoose');

// // const MeetingSchema = new mongoose.Schema({
// //   meetingId: {
// //     type: String,
// //     required: [true, 'Meeting ID is required'],
// //     unique: true,
// //     trim: true,
// //     minlength: [6, 'Meeting ID must be at least 6 characters long'],
// //     maxlength: [20, 'Meeting ID cannot exceed 20 characters'],
// //     match: [/^[a-zA-Z0-9_-]+$/, 'Meeting ID can only contain letters, numbers, underscores, and hyphens']
// //   },
// //   title: {
// //     type: String,
// //     required: [true, 'Meeting title is required'],
// //     trim: true,
// //     minlength: [3, 'Meeting title must be at least 3 characters long'],
// //     maxlength: [100, 'Meeting title cannot exceed 100 characters']
// //   },
// //   description: {
// //     type: String,
// //     trim: true,
// //     maxlength: [500, 'Description cannot exceed 500 characters']
// //   },
// //   host: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User',
// //     required: [true, 'Meeting host is required']
// //   },
// //   coHosts: [{
// //     user: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User'
// //     },
// //     assignedAt: {
// //       type: Date,
// //       default: Date.now
// //     },
// //     assignedBy: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User'
// //     }
// //   }],
// //   participants: [{
// //     user: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true
// //     },
// //     role: {
// //       type: String,
// //       enum: ['participant', 'co-host', 'host'],
// //       default: 'participant'
// //     },
// //     joinedAt: {
// //       type: Date,
// //       default: Date.now
// //     },
// //     leftAt: Date,
// //     isActive: {
// //       type: Boolean,
// //       default: true
// //     },
// //     permissions: {
// //       canShareScreen: { type: Boolean, default: true },
// //       canRecord: { type: Boolean, default: false },
// //       canChat: { type: Boolean, default: true },
// //       canRename: { type: Boolean, default: false },
// //       canRemoveOthers: { type: Boolean, default: false }
// //     },
// //     deviceInfo: {
// //       browser: String,
// //       os: String,
// //       deviceType: String,
// //       ipAddress: String
// //     }
// //   }],
// //   invitedUsers: [{
// //     user: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User'
// //     },
// //     invitedAt: {
// //       type: Date,
// //       default: Date.now
// //     },
// //     invitedBy: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User'
// //     },
// //     status: {
// //       type: String,
// //       enum: ['pending', 'accepted', 'declined', 'expired'],
// //       default: 'pending'
// //     }
// //   }],
// //   status: {
// //     type: String,
// //     enum: ['scheduled', 'active', 'ended', 'cancelled'],
// //     default: 'scheduled'
// //   },
// //   scheduledFor: {
// //     type: Date,
// //     required: [true, 'Meeting schedule is required']
// //   },
// //   startedAt: Date,
// //   endedAt: Date,
// //   duration: {
// //     type: Number, // in minutes
// //     default: 60
// //   },
// //   maxParticipants: {
// //     type: Number,
// //     default: 100,
// //     min: [1, 'Minimum 1 participant required'],
// //     max: [1000, 'Maximum 1000 participants allowed']
// //   },
// //   settings: {
// //     // Security settings
// //     password: {
// //       type: String,
// //       minlength: [4, 'Password must be at least 4 characters long']
// //     },
// //     waitingRoom: {
// //       type: Boolean,
// //       default: true
// //     },
// //     allowJoinBeforeHost: {
// //       type: Boolean,
// //       default: false
// //     },
// //     muteParticipantsOnEntry: {
// //       type: Boolean,
// //       default: false
// //     },
// //     videoParticipantsOnEntry: {
// //       type: Boolean,
// //       default: false
// //     },
    
// //     // Recording settings
// //     recordingAllowed: {
// //       type: Boolean,
// //       default: true
// //     },
// //     autoRecord: {
// //       type: Boolean,
// //       default: false
// //     },
// //     recordingConsent: {
// //       type: Boolean,
// //       default: true
// //     },
    
// //     // Feature settings
// //     screenShareAllowed: {
// //       type: Boolean,
// //       default: true
// //     },
// //     chatAllowed: {
// //       type: Boolean,
// //       default: true
// //     },
// //     fileSharingAllowed: {
// //       type: Boolean,
// //       default: true
// //     },
// //     breakoutRoomsAllowed: {
// //       type: Boolean,
// //       default: false
// //     },
// //     pollsAllowed: {
// //       type: Boolean,
// //       default: true
// //     },
    
// //     // Audio/Video settings
// //     audioQuality: {
// //       type: String,
// //       enum: ['low', 'medium', 'high'],
// //       default: 'medium'
// //     },
// //     videoQuality: {
// //       type: String,
// //       enum: ['low', 'medium', 'high', 'hd'],
// //       default: 'medium'
// //     },
// //     maxBitrate: {
// //       type: Number,
// //       default: 1000 // kbps
// //     }
// //   },
// //   recordings: [{
// //     id: {
// //       type: String,
// //       required: true
// //     },
// //     filename: {
// //       type: String,
// //       required: true
// //     },
// //     fileSize: Number, // in bytes
// //     duration: Number, // in seconds
// //     format: {
// //       type: String,
// //       enum: ['mp4', 'webm', 'mkv'],
// //       default: 'mp4'
// //     },
// //     quality: {
// //       type: String,
// //       enum: ['low', 'medium', 'high'],
// //       default: 'medium'
// //     },
// //     recordedBy: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User'
// //     },
// //     recordedAt: {
// //       type: Date,
// //       default: Date.now
// //     },
// //     status: {
// //       type: String,
// //       enum: ['processing', 'completed', 'failed'],
// //       default: 'processing'
// //     },
// //     url: String,
// //     thumbnailUrl: String
// //   }],
// //   chat: [{
// //     user: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true
// //     },
// //     message: {
// //       type: String,
// //       required: true,
// //       maxlength: [1000, 'Message cannot exceed 1000 characters']
// //     },
// //     timestamp: {
// //       type: Date,
// //       default: Date.now
// //     },
// //     type: {
// //       type: String,
// //       enum: ['text', 'file', 'system'],
// //       default: 'text'
// //     },
// //     fileUrl: String,
// //     fileName: String,
// //     fileSize: Number
// //   }],
// //   polls: [{
// //     question: {
// //       type: String,
// //       required: true,
// //       maxlength: [200, 'Question cannot exceed 200 characters']
// //     },
// //     options: [{
// //       text: {
// //         type: String,
// //         required: true,
// //         maxlength: [100, 'Option text cannot exceed 100 characters']
// //       },
// //       votes: [{
// //         user: {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: 'User'
// //         },
// //         votedAt: {
// //           type: Date,
// //           default: Date.now
// //         }
// //       }]
// //     }],
// //     createdBy: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: 'User',
// //       required: true
// //     },
// //     createdAt: {
// //       type: Date,
// //       default: Date.now
// //     },
// //     isActive: {
// //       type: Boolean,
// //       default: true
// //     },
// //     allowMultipleVotes: {
// //       type: Boolean,
// //       default: false
// //     },
// //     showResults: {
// //       type: Boolean,
// //       default: true
// //     }
// //   }],
// //   analytics: {
// //     totalParticipants: {
// //       type: Number,
// //       default: 0
// //     },
// //     peakParticipants: {
// //       type: Number,
// //       default: 0
// //     },
// //     averageDuration: Number, // in minutes
// //     totalRecordings: {
// //       type: Number,
// //       default: 0
// //     },
// //     totalChatMessages: {
// //       type: Number,
// //       default: 0
// //     },
// //     totalPolls: {
// //       type: Number,
// //       default: 0
// //     }
// //   },
// //   tags: [{
// //     type: String,
// //     trim: true,
// //     maxlength: [20, 'Tag cannot exceed 20 characters']
// //   }],
// //   isPublic: {
// //     type: Boolean,
// //     default: false
// //   },
// //   createdAt: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   updatedAt: {
// //     type: Date,
// //     default: Date.now
// //   }
// // }, {
// //   timestamps: true,
// //   toJSON: { virtuals: true },
// //   toObject: { virtuals: true }
// // });

// // // Virtual for meeting duration
// // MeetingSchema.virtual('meetingDuration').get(function() {
// //   if (this.startedAt && this.endedAt) {
// //     return Math.round((this.endedAt - this.startedAt) / (1000 * 60)); // minutes
// //   }
// //   return 0;
// // });

// // // Virtual for active participants count
// // MeetingSchema.virtual('activeParticipantsCount').get(function() {
// //   return this.participants.filter(p => p.isActive).length;
// // });

// // // Virtual for meeting URL
// // MeetingSchema.virtual('meetingUrl').get(function() {
// //   return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/meeting/${this.meetingId}`;
// // });

// // // Indexes for better query performance
// // // MeetingSchema.index({ meetingId: 1 });
// // MeetingSchema.index({ host: 1 });
// // MeetingSchema.index({ status: 1 });
// // MeetingSchema.index({ scheduledFor: 1 });
// // MeetingSchema.index({ 'participants.user': 1 });
// // MeetingSchema.index({ createdAt: -1 });
// // MeetingSchema.index({ tags: 1 });
// // MeetingSchema.index({ isPublic: 1 });

// // // Update updatedAt timestamp
// // MeetingSchema.pre('save', function(next) {
// //   this.updatedAt = Date.now();
// //   next();
// // });

// // // Method to add participant
// // MeetingSchema.methods.addParticipant = async function(userId, role = 'participant') {
// //   const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  
// //   if (existingParticipant) {
// //     existingParticipant.isActive = true;
// //     existingParticipant.joinedAt = Date.now();
// //     existingParticipant.leftAt = null;
// //   } else {
// //     this.participants.push({
// //       user: userId,
// //       role,
// //       joinedAt: Date.now(),
// //       isActive: true
// //     });
// //   }
  
// //   this.analytics.totalParticipants += 1;
// //   if (this.participants.filter(p => p.isActive).length > this.analytics.peakParticipants) {
// //     this.analytics.peakParticipants = this.participants.filter(p => p.isActive).length;
// //   }
  
// //   return await this.save();
// // };

// // // Method to remove participant
// // MeetingSchema.methods.removeParticipant = async function(userId) {
// //   const participant = this.participants.find(p => p.user.toString() === userId.toString());
// //   if (participant) {
// //     participant.isActive = false;
// //     participant.leftAt = Date.now();
// //   }
// //   return await this.save();
// // };

// // // Method to start meeting
// // MeetingSchema.methods.startMeeting = async function() {
// //   this.status = 'active';
// //   this.startedAt = Date.now();
// //   return await this.save();
// // };

// // // Method to end meeting
// // MeetingSchema.methods.endMeeting = async function() {
// //   this.status = 'ended';
// //   this.endedAt = Date.now();
// //   return await this.save();
// // };

// // // Method to add chat message
// // MeetingSchema.methods.addChatMessage = async function(userId, message, type = 'text') {
// //   this.chat.push({
// //     user: userId,
// //     message,
// //     type
// //   });
// //   this.analytics.totalChatMessages += 1;
// //   return await this.save();
// // };

// // // Method to create poll
// // MeetingSchema.methods.createPoll = async function(question, options, createdBy, allowMultipleVotes = false) {
// //   this.polls.push({
// //     question,
// //     options: options.map(option => ({ text: option })),
// //     createdBy,
// //     allowMultipleVotes
// //   });
// //   this.analytics.totalPolls += 1;
// //   return await this.save();
// // };

// // module.exports = mongoose.model('Meeting', MeetingSchema);