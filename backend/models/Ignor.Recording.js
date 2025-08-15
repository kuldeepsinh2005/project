const mongoose = require('mongoose');

const RecordingSchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: [true, 'Meeting ID is required']
  },
  recordingId: {
    type: String,
    required: [true, 'Recording ID is required'],
    unique: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  format: {
    type: String,
    enum: ['mp4', 'webm', 'mkv', 'avi'],
    default: 'mp4'
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'hd', '4k'],
    default: 'medium'
  },
  resolution: {
    width: Number,
    height: Number
  },
  bitrate: Number, // kbps
  fps: Number, // frames per second
  audioCodec: String,
  videoCodec: String,
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'deleted'],
    default: 'processing'
  },
  processingProgress: {
    type: Number, // percentage 0-100
    default: 0
  },
  processingError: String,
  thumbnailPath: String,
  thumbnailUrl: String,
  downloadUrl: String,
  streamUrl: String,
  accessLevel: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'private'
  },
  allowedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'download', 'edit', 'delete'],
      default: 'view'
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  metadata: {
    title: String,
    description: String,
    tags: [String],
    language: {
      type: String,
      default: 'en'
    },
    transcription: {
      available: {
        type: Boolean,
        default: false
      },
      language: String,
      confidence: Number,
      text: String
    },
    chapters: [{
      title: String,
      startTime: Number, // in seconds
      endTime: Number // in seconds
    }]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    averageWatchTime: Number, // in seconds
    completionRate: Number // percentage
  },
  storage: {
    provider: {
      type: String,
      enum: ['local', 'aws', 'gcp', 'azure'],
      default: 'local'
    },
    bucket: String,
    region: String,
    storageClass: {
      type: String,
      enum: ['standard', 'reduced_redundancy', 'glacier', 'deep_archive'],
      default: 'standard'
    },
    lifecyclePolicy: String
  },
  retention: {
    policy: {
      type: String,
      enum: ['keep_forever', 'delete_after_days', 'archive_after_days'],
      default: 'keep_forever'
    },
    days: Number,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file size in human readable format
RecordingSchema.virtual('fileSizeFormatted').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (this.fileSize === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for duration in human readable format
RecordingSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for processing status
RecordingSchema.virtual('isProcessing').get(function() {
  return this.status === 'processing';
});

// Virtual for is accessible
RecordingSchema.virtual('isAccessible').get(function() {
  return this.status === 'completed' && this.accessLevel !== 'deleted';
});

// Indexes for better query performance
RecordingSchema.index({ recordingId: 1 });
RecordingSchema.index({ meetingId: 1 });
RecordingSchema.index({ recordedBy: 1 });
RecordingSchema.index({ status: 1 });
RecordingSchema.index({ createdAt: -1 });
RecordingSchema.index({ 'allowedUsers.user': 1 });
RecordingSchema.index({ accessLevel: 1 });

// Update updatedAt timestamp
RecordingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if user can access recording
RecordingSchema.methods.canAccess = function(userId) {
  if (this.accessLevel === 'public') return true;
  if (this.recordedBy.toString() === userId.toString()) return true;
  
  const allowedUser = this.allowedUsers.find(au => au.user.toString() === userId.toString());
  return !!allowedUser;
};

// Method to grant access to user
RecordingSchema.methods.grantAccess = async function(userId, permission = 'view', grantedBy) {
  const existingAccess = this.allowedUsers.find(au => au.user.toString() === userId.toString());
  
  if (existingAccess) {
    existingAccess.permission = permission;
    existingAccess.grantedAt = Date.now();
    if (grantedBy) existingAccess.grantedBy = grantedBy;
  } else {
    this.allowedUsers.push({
      user: userId,
      permission,
      grantedAt: Date.now(),
      grantedBy
    });
  }
  
  return await this.save();
};

// Method to revoke access
RecordingSchema.methods.revokeAccess = async function(userId) {
  this.allowedUsers = this.allowedUsers.filter(au => au.user.toString() !== userId.toString());
  return await this.save();
};

// Method to increment view count
RecordingSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  return await this.save();
};

// Method to increment download count
RecordingSchema.methods.incrementDownloads = async function() {
  this.analytics.downloads += 1;
  return await this.save();
};

// Method to update processing progress
RecordingSchema.methods.updateProgress = async function(progress) {
  this.processingProgress = progress;
  if (progress >= 100) {
    this.status = 'completed';
  }
  return await this.save();
};

module.exports = mongoose.model('Recording', RecordingSchema); 