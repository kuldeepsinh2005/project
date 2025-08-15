const Joi = require('joi');

// User validation schemas
const userValidation = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(20)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 20 characters',
        'string.pattern.base': 'Username can only contain letters, numbers, underscores, and hyphens'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    firstName: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name is required',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name is required',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    profileImage: Joi.string()
      .uri()
      .optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  update: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(50)
      .optional(),
    lastName: Joi.string()
      .min(1)
      .max(50)
      .optional(),
    profileImage: Joi.string()
      .uri()
      .optional(),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        meetingReminders: Joi.boolean()
      }),
      privacy: Joi.object({
        showOnlineStatus: Joi.boolean(),
        allowDirectMessages: Joi.boolean()
      }),
      video: Joi.object({
        defaultCamera: Joi.string(),
        defaultMicrophone: Joi.string(),
        autoJoinWithVideo: Joi.boolean(),
        autoJoinWithAudio: Joi.boolean()
      })
    }).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match'
      })
  })
};

// Meeting validation schemas
const meetingValidation = {
  create: Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Meeting title must be at least 3 characters long',
        'string.max': 'Meeting title cannot exceed 100 characters'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    scheduledFor: Joi.date()
      .greater('now')
      .required()
      .messages({
        'date.greater': 'Meeting must be scheduled for a future date'
      }),
    duration: Joi.number()
      .min(15)
      .max(480)
      .default(60)
      .messages({
        'number.min': 'Meeting duration must be at least 15 minutes',
        'number.max': 'Meeting duration cannot exceed 8 hours'
      }),
    maxParticipants: Joi.number()
      .min(1)
      .max(1000)
      .default(100)
      .messages({
        'number.min': 'Minimum 1 participant required',
        'number.max': 'Maximum 1000 participants allowed'
      }),
    settings: Joi.object({
      password: Joi.string()
        .min(4)
        .optional()
        .messages({
          'string.min': 'Meeting password must be at least 4 characters long'
        }),
      waitingRoom: Joi.boolean().default(true),
      allowJoinBeforeHost: Joi.boolean().default(false),
      muteParticipantsOnEntry: Joi.boolean().default(false),
      videoParticipantsOnEntry: Joi.boolean().default(false),
      recordingAllowed: Joi.boolean().default(true),
      autoRecord: Joi.boolean().default(false),
      screenShareAllowed: Joi.boolean().default(true),
      chatAllowed: Joi.boolean().default(true),
      fileSharingAllowed: Joi.boolean().default(true),
      breakoutRoomsAllowed: Joi.boolean().default(false),
      pollsAllowed: Joi.boolean().default(true),
      audioQuality: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium'),
      videoQuality: Joi.string()
        .valid('low', 'medium', 'high', 'hd')
        .default('medium'),
      maxBitrate: Joi.number()
        .min(100)
        .max(10000)
        .default(1000)
        .messages({
          'number.min': 'Minimum bitrate is 100 kbps',
          'number.max': 'Maximum bitrate is 10000 kbps'
        })
    }).optional(),
    tags: Joi.array()
      .items(Joi.string().max(20))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 tags allowed',
        'string.max': 'Tag cannot exceed 20 characters'
      }),
    isPublic: Joi.boolean().default(false)
  }),

  update: Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .optional(),
    description: Joi.string()
      .max(500)
      .optional(),
    scheduledFor: Joi.date()
      .greater('now')
      .optional(),
    duration: Joi.number()
      .min(15)
      .max(480)
      .optional(),
    maxParticipants: Joi.number()
      .min(1)
      .max(1000)
      .optional(),
    settings: Joi.object({
      password: Joi.string()
        .min(4)
        .optional(),
      waitingRoom: Joi.boolean(),
      allowJoinBeforeHost: Joi.boolean(),
      muteParticipantsOnEntry: Joi.boolean(),
      videoParticipantsOnEntry: Joi.boolean(),
      recordingAllowed: Joi.boolean(),
      autoRecord: Joi.boolean(),
      screenShareAllowed: Joi.boolean(),
      chatAllowed: Joi.boolean(),
      fileSharingAllowed: Joi.boolean(),
      breakoutRoomsAllowed: Joi.boolean(),
      pollsAllowed: Joi.boolean(),
      audioQuality: Joi.string()
        .valid('low', 'medium', 'high'),
      videoQuality: Joi.string()
        .valid('low', 'medium', 'high', 'hd'),
      maxBitrate: Joi.number()
        .min(100)
        .max(10000)
    }).optional(),
    tags: Joi.array()
      .items(Joi.string().max(20))
      .max(10)
      .optional(),
    isPublic: Joi.boolean()
  }),

  join: Joi.object({
    meetingId: Joi.string()
      .min(6)
      .max(20)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .required()
      .messages({
        'string.min': 'Meeting ID must be at least 6 characters long',
        'string.max': 'Meeting ID cannot exceed 20 characters',
        'string.pattern.base': 'Meeting ID can only contain letters, numbers, underscores, and hyphens'
      }),
    password: Joi.string()
      .min(4)
      .optional(),
    name: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name is required',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      })
  })
};

// Recording validation schemas
const recordingValidation = {
  create: Joi.object({
    meetingId: Joi.string()
      .required()
      .messages({
        'any.required': 'Meeting ID is required'
      }),
    quality: Joi.string()
      .valid('low', 'medium', 'high', 'hd', '4k')
      .default('medium'),
    format: Joi.string()
      .valid('mp4', 'webm', 'mkv', 'avi')
      .default('mp4'),
    resolution: Joi.object({
      width: Joi.number()
        .min(320)
        .max(3840)
        .required(),
      height: Joi.number()
        .min(240)
        .max(2160)
        .required()
    }).optional(),
    bitrate: Joi.number()
      .min(100)
      .max(10000)
      .optional(),
    fps: Joi.number()
      .min(1)
      .max(60)
      .optional()
  }),

  update: Joi.object({
    metadata: Joi.object({
      title: Joi.string()
        .max(200)
        .optional(),
      description: Joi.string()
        .max(1000)
        .optional(),
      tags: Joi.array()
        .items(Joi.string().max(20))
        .max(10)
        .optional(),
      language: Joi.string()
        .length(2)
        .default('en')
        .optional()
    }).optional(),
    accessLevel: Joi.string()
      .valid('public', 'private', 'restricted')
      .optional()
  })
};

// Notification validation schemas
const notificationValidation = {
  create: Joi.object({
    recipient: Joi.string()
      .required()
      .messages({
        'any.required': 'Recipient is required'
      }),
    type: Joi.string()
      .valid(
        'meeting_invitation',
        'meeting_reminder',
        'meeting_started',
        'meeting_ended',
        'recording_ready',
        'recording_shared',
        'chat_message',
        'system_alert',
        'subscription_update',
        'security_alert',
        'file_shared',
        'poll_created',
        'breakout_room_assigned',
        'co_host_assigned',
        'permission_granted',
        'permission_revoked'
      )
      .required(),
    title: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Title cannot exceed 100 characters'
      }),
    message: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Message cannot exceed 500 characters'
      }),
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .default('normal'),
    data: Joi.object({
      meetingId: Joi.string().optional(),
      recordingId: Joi.string().optional(),
      fileId: Joi.string().optional(),
      pollId: Joi.string().optional(),
      roomId: Joi.string().optional(),
      url: Joi.string().uri().optional(),
      actionUrl: Joi.string().uri().optional(),
      metadata: Joi.object().optional()
    }).optional(),
    deliveryChannels: Joi.array()
      .items(Joi.object({
        type: Joi.string()
          .valid('in_app', 'email', 'push', 'sms')
          .required(),
        status: Joi.string()
          .valid('pending', 'sent', 'delivered', 'failed')
          .default('pending')
      }))
      .min(1)
      .optional()
  })
};

// Subscription validation schemas
const subscriptionValidation = {
  create: Joi.object({
    plan: Joi.string()
      .valid('free', 'basic', 'premium', 'enterprise')
      .required(),
    billingCycle: Joi.string()
      .valid('monthly', 'quarterly', 'yearly')
      .default('monthly'),
    amount: Joi.number()
      .min(0)
      .required(),
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'CAD', 'AUD')
      .default('USD'),
    paymentMethod: Joi.string()
      .valid('credit_card', 'paypal', 'bank_transfer', 'crypto')
      .default('credit_card'),
    paymentProvider: Joi.string()
      .valid('stripe', 'paypal', 'square', 'razorpay')
      .default('stripe'),
    autoRenew: Joi.boolean().default(true)
  }),

  update: Joi.object({
    plan: Joi.string()
      .valid('free', 'basic', 'premium', 'enterprise')
      .optional(),
    billingCycle: Joi.string()
      .valid('monthly', 'quarterly', 'yearly')
      .optional(),
    amount: Joi.number()
      .min(0)
      .optional(),
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'CAD', 'AUD')
      .optional(),
    autoRenew: Joi.boolean().optional()
  })
};

// Analytics validation schemas
const analyticsValidation = {
  create: Joi.object({
    period: Joi.string()
      .valid('hourly', 'daily', 'weekly', 'monthly')
      .required(),
    date: Joi.date().default(Date.now),
    userAnalytics: Joi.object({
      totalUsers: Joi.number().min(0).default(0),
      activeUsers: Joi.object({
        daily: Joi.number().min(0).default(0),
        weekly: Joi.number().min(0).default(0),
        monthly: Joi.number().min(0).default(0)
      }).optional(),
      newUsers: Joi.object({
        daily: Joi.number().min(0).default(0),
        weekly: Joi.number().min(0).default(0),
        monthly: Joi.number().min(0).default(0)
      }).optional()
    }).optional(),
    meetingAnalytics: Joi.object({
      totalMeetings: Joi.number().min(0).default(0),
      activeMeetings: Joi.number().min(0).default(0),
      averageMeetingDuration: Joi.number().min(0).default(0)
    }).optional(),
    performanceAnalytics: Joi.object({
      serverLoad: Joi.object({
        cpu: Joi.number().min(0).max(100).default(0),
        memory: Joi.number().min(0).max(100).default(0),
        bandwidth: Joi.number().min(0).default(0)
      }).optional(),
      responseTimes: Joi.object({
        average: Joi.number().min(0).default(0),
        p95: Joi.number().min(0).default(0),
        p99: Joi.number().min(0).default(0)
      }).optional(),
      uptime: Joi.number().min(0).max(100).default(99.9)
    }).optional()
  })
};

// Audit validation schemas
const auditValidation = {
  create: Joi.object({
    eventType: Joi.string()
      .valid(
        'user_login', 'user_logout', 'user_registration', 'password_change',
        'password_reset', 'email_verification', 'two_factor_enabled',
        'two_factor_disabled', 'meeting_created', 'meeting_joined',
        'meeting_left', 'meeting_ended', 'meeting_cancelled', 'meeting_updated',
        'participant_added', 'participant_removed', 'co_host_assigned',
        'co_host_removed', 'recording_started', 'recording_stopped',
        'recording_deleted', 'recording_shared', 'recording_downloaded',
        'permission_granted', 'permission_revoked', 'role_changed',
        'access_granted', 'access_revoked', 'failed_login', 'suspicious_activity',
        'ip_blocked', 'account_locked', 'account_unlocked', 'security_alert',
        'system_maintenance', 'backup_created', 'update_deployed', 'error_logged',
        'performance_alert', 'subscription_created', 'subscription_cancelled',
        'subscription_updated', 'payment_processed', 'refund_issued',
        'data_exported', 'data_deleted', 'privacy_settings_changed',
        'gdpr_request', 'data_breach'
      )
      .required(),
    userId: Joi.string().optional(),
    ipAddress: Joi.string().ip().optional(),
    userAgent: Joi.string().optional(),
    targetType: Joi.string()
      .valid('user', 'meeting', 'recording', 'subscription', 'system', 'file', 'notification')
      .required(),
    targetId: Joi.string().optional(),
    targetName: Joi.string().optional(),
    details: Joi.object({
      description: Joi.string()
        .max(500)
        .required()
        .messages({
          'string.max': 'Description cannot exceed 500 characters'
        }),
      metadata: Joi.object().optional(),
      oldValue: Joi.object().optional(),
      newValue: Joi.object().optional(),
      reason: Joi.string().optional(),
      location: Joi.object({
        country: Joi.string().optional(),
        city: Joi.string().optional(),
        timezone: Joi.string().optional()
      }).optional()
    }).required(),
    security: Joi.object({
      riskLevel: Joi.string()
        .valid('low', 'medium', 'high', 'critical')
        .default('low'),
      isSuspicious: Joi.boolean().default(false),
      flagged: Joi.boolean().default(false)
    }).optional()
  })
};

// Generic validation function
const validate = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw new Error(JSON.stringify(errors));
  }
  
  return value;
};

module.exports = {
  userValidation,
  meetingValidation,
  recordingValidation,
  notificationValidation,
  subscriptionValidation,
  analyticsValidation,
  auditValidation,
  validate
};