const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    required: [true, 'Plan type is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'suspended'],
    default: 'active'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: [true, 'Subscription amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  features: {
    maxParticipants: {
      type: Number,
      default: 10
    },
    maxMeetingDuration: {
      type: Number, // in minutes
      default: 40
    },
    recordingEnabled: {
      type: Boolean,
      default: false
    },
    recordingStorage: {
      type: Number, // in GB
      default: 0
    },
    screenSharingEnabled: {
      type: Boolean,
      default: true
    },
    customBranding: {
      type: Boolean,
      default: false
    },
    breakoutRooms: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    whiteboard: {
      type: Boolean,
      default: false
    },
    transcription: {
      type: Boolean,
      default: false
    },
    liveStreaming: {
      type: Boolean,
      default: false
    },
    webinarFeatures: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    meetingsThisMonth: {
      type: Number,
      default: 0
    },
    totalMeetingTime: {
      type: Number, // in minutes
      default: 0
    },
    recordingsThisMonth: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number, // in GB
      default: 0
    },
    participantsThisMonth: {
      type: Number,
      default: 0
    }
  },
  limits: {
    maxMeetingsPerMonth: {
      type: Number,
      default: 10
    },
    maxRecordingTime: {
      type: Number, // in minutes
      default: 0
    },
    maxStorageGB: {
      type: Number,
      default: 1
    }
  },
  billing: {
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'crypto'],
      default: 'credit_card'
    },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'paypal', 'square', 'razorpay'],
      default: 'stripe'
    },
    subscriptionId: String, // External subscription ID
    customerId: String, // External customer ID
    invoiceId: String,
    lastBillingDate: Date,
    nextBillingDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    trialEndsAt: Date,
    gracePeriodEndsAt: Date
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  reactivatedAt: Date,
  reactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
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

// Virtual for is active
SubscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for is trial
SubscriptionSchema.virtual('isTrial').get(function() {
  return this.billing.trialEndsAt && this.billing.trialEndsAt > Date.now();
});

// Virtual for is expired
SubscriptionSchema.virtual('isExpired').get(function() {
  return this.endDate && this.endDate < Date.now();
});

// Virtual for is in grace period
SubscriptionSchema.virtual('isInGracePeriod').get(function() {
  return this.billing.gracePeriodEndsAt && this.billing.gracePeriodEndsAt > Date.now();
});

// Virtual for days until renewal
SubscriptionSchema.virtual('daysUntilRenewal').get(function() {
  if (!this.billing.nextBillingDate) return null;
  const now = new Date();
  const diffTime = this.billing.nextBillingDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for usage percentage
SubscriptionSchema.virtual('usagePercentage').get(function() {
  const usage = this.usage;
  const limits = this.limits;
  
  const meetingUsage = (usage.meetingsThisMonth / limits.maxMeetingsPerMonth) * 100;
  const storageUsage = (usage.storageUsed / limits.maxStorageGB) * 100;
  
  return Math.max(meetingUsage, storageUsage);
});

// Indexes for better query performance
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ plan: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ 'billing.nextBillingDate': 1 });
SubscriptionSchema.index({ 'billing.trialEndsAt': 1 });
SubscriptionSchema.index({ createdAt: -1 });

// Compound indexes for common queries
SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index({ status: 1, 'billing.nextBillingDate': 1 });

// Update updatedAt timestamp
SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to cancel subscription
SubscriptionSchema.methods.cancel = function(userId, reason = '') {
  this.status = 'cancelled';
  this.cancelledAt = Date.now();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  this.billing.autoRenew = false;
  return this.save();
};

// Method to reactivate subscription
SubscriptionSchema.methods.reactivate = function(userId) {
  this.status = 'active';
  this.reactivatedAt = Date.now();
  this.reactivatedBy = userId;
  this.billing.autoRenew = true;
  return this.save();
};

// Method to update usage
SubscriptionSchema.methods.updateUsage = function(usageData) {
  Object.assign(this.usage, usageData);
  return this.save();
};

// Method to check if feature is available
SubscriptionSchema.methods.hasFeature = function(featureName) {
  return this.features[featureName] === true;
};

// Method to check usage limits
SubscriptionSchema.methods.checkUsageLimit = function(limitType, currentValue) {
  const limits = {
    meetings: this.limits.maxMeetingsPerMonth,
    storage: this.limits.maxStorageGB,
    recording: this.limits.maxRecordingTime
  };
  
  return currentValue < limits[limitType];
};

// Static method to get plan features
SubscriptionSchema.statics.getPlanFeatures = function(plan) {
  const features = {
    free: {
      maxParticipants: 10,
      maxMeetingDuration: 40,
      recordingEnabled: false,
      recordingStorage: 0,
      screenSharingEnabled: true,
      customBranding: false,
      breakoutRooms: false,
      advancedAnalytics: false,
      prioritySupport: false,
      whiteboard: false,
      transcription: false,
      liveStreaming: false,
      webinarFeatures: false
    },
    basic: {
      maxParticipants: 50,
      maxMeetingDuration: 60,
      recordingEnabled: true,
      recordingStorage: 5,
      screenSharingEnabled: true,
      customBranding: false,
      breakoutRooms: false,
      advancedAnalytics: false,
      prioritySupport: false,
      whiteboard: true,
      transcription: false,
      liveStreaming: false,
      webinarFeatures: false
    },
    premium: {
      maxParticipants: 200,
      maxMeetingDuration: 120,
      recordingEnabled: true,
      recordingStorage: 20,
      screenSharingEnabled: true,
      customBranding: true,
      breakoutRooms: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteboard: true,
      transcription: true,
      liveStreaming: true,
      webinarFeatures: false
    },
    enterprise: {
      maxParticipants: 1000,
      maxMeetingDuration: 480,
      recordingEnabled: true,
      recordingStorage: 100,
      screenSharingEnabled: true,
      customBranding: true,
      breakoutRooms: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteboard: true,
      transcription: true,
      liveStreaming: true,
      webinarFeatures: true
    }
  };
  
  return features[plan] || features.free;
};

module.exports = mongoose.model('Subscription', SubscriptionSchema); 