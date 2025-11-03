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
