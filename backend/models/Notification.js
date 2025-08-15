// backend/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String, required: true }, // e.g. 'meeting_invite', 'message', 'system'
  message: { type: String, default: '' },
  link: { type: String, default: '' }, // optional deep link (eg /meeting/ABC123)
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Simple index to fetch unread notifications quickly
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);


// const mongoose = require('mongoose');

// const NotificationSchema = new mongoose.Schema({
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: [true, 'Recipient is required']
//   },
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   type: {
//     type: String,
//     enum: [
//       'meeting_invitation',
//       'meeting_reminder',
//       'meeting_started',
//       'meeting_ended',
//       'recording_ready',
//       'recording_shared',
//       'chat_message',
//       'system_alert',
//       'subscription_update',
//       'security_alert',
//       'file_shared',
//       'poll_created',
//       'breakout_room_assigned',
//       'co_host_assigned',
//       'permission_granted',
//       'permission_revoked'
//     ],
//     required: [true, 'Notification type is required']
//   },
//   title: {
//     type: String,
//     required: [true, 'Notification title is required'],
//     maxlength: [100, 'Title cannot exceed 100 characters']
//   },
//   message: {
//     type: String,
//     required: [true, 'Notification message is required'],
//     maxlength: [500, 'Message cannot exceed 500 characters']
//   },
//   data: {
//     meetingId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Meeting'
//     },
//     recordingId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Recording'
//     },
//     fileId: String,
//     pollId: String,
//     roomId: String,
//     url: String,
//     actionUrl: String,
//     metadata: mongoose.Schema.Types.Mixed
//   },
//   priority: {
//     type: String,
//     enum: ['low', 'normal', 'high', 'urgent'],
//     default: 'normal'
//   },
//   status: {
//     type: String,
//     enum: ['unread', 'read', 'archived'],
//     default: 'unread'
//   },
//   readAt: Date,
//   archivedAt: Date,
//   deliveryChannels: [{
//     type: {
//       type: String,
//       enum: ['in_app', 'email', 'push', 'sms'],
//       required: true
//     },
//     status: {
//       type: String,
//       enum: ['pending', 'sent', 'delivered', 'failed'],
//       default: 'pending'
//     },
//     sentAt: Date,
//     deliveredAt: Date,
//     error: String
//   }],
//   expiresAt: Date,
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

// // Virtual for is expired
// NotificationSchema.virtual('isExpired').get(function() {
//   return this.expiresAt && this.expiresAt < Date.now();
// });

// // Virtual for is urgent
// NotificationSchema.virtual('isUrgent').get(function() {
//   return this.priority === 'urgent';
// });

// // Virtual for delivery status
// NotificationSchema.virtual('deliveryStatus').get(function() {
//   const channels = this.deliveryChannels;
//   if (channels.length === 0) return 'pending';
  
//   const allSent = channels.every(ch => ch.status === 'sent' || ch.status === 'delivered');
//   const anyFailed = channels.some(ch => ch.status === 'failed');
  
//   if (anyFailed) return 'failed';
//   if (allSent) return 'delivered';
//   return 'pending';
// });

// // Indexes for better query performance
// NotificationSchema.index({ recipient: 1 });
// NotificationSchema.index({ type: 1 });
// NotificationSchema.index({ status: 1 });
// NotificationSchema.index({ priority: 1 });
// NotificationSchema.index({ createdAt: -1 });
// NotificationSchema.index({ expiresAt: 1 });
// NotificationSchema.index({ 'deliveryChannels.status': 1 });

// // Compound indexes for common queries
// NotificationSchema.index({ recipient: 1, status: 1 });
// NotificationSchema.index({ recipient: 1, createdAt: -1 });
// NotificationSchema.index({ type: 1, status: 1 });

// // Update updatedAt timestamp
// NotificationSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// // Method to mark as read
// NotificationSchema.methods.markAsRead = function() {
//   this.status = 'read';
//   this.readAt = Date.now();
//   return this.save();
// };

// // Method to archive notification
// NotificationSchema.methods.archive = function() {
//   this.status = 'archived';
//   this.archivedAt = Date.now();
//   return this.save();
// };

// // Method to update delivery status
// NotificationSchema.methods.updateDeliveryStatus = function(channelType, status, error = null) {
//   const channel = this.deliveryChannels.find(ch => ch.type === channelType);
//   if (channel) {
//     channel.status = status;
//     if (status === 'sent') {
//       channel.sentAt = Date.now();
//     } else if (status === 'delivered') {
//       channel.deliveredAt = Date.now();
//     } else if (status === 'failed') {
//       channel.error = error;
//     }
//   }
//   return this.save();
// };

// // Static method to create meeting invitation
// NotificationSchema.statics.createMeetingInvitation = function(recipientId, senderId, meetingId, meetingTitle) {
//   return this.create({
//     recipient: recipientId,
//     sender: senderId,
//     type: 'meeting_invitation',
//     title: 'Meeting Invitation',
//     message: `You have been invited to join "${meetingTitle}"`,
//     data: {
//       meetingId,
//       actionUrl: `/meeting/${meetingId}`
//     },
//     priority: 'high',
//     deliveryChannels: [
//       { type: 'in_app' },
//       { type: 'email' }
//     ]
//   });
// };

// // Static method to create meeting reminder
// NotificationSchema.statics.createMeetingReminder = function(recipientId, meetingId, meetingTitle, scheduledFor) {
//   return this.create({
//     recipient: recipientId,
//     type: 'meeting_reminder',
//     title: 'Meeting Reminder',
//     message: `Your meeting "${meetingTitle}" starts in 15 minutes`,
//     data: {
//       meetingId,
//       actionUrl: `/meeting/${meetingId}`,
//       metadata: { scheduledFor }
//     },
//     priority: 'high',
//     deliveryChannels: [
//       { type: 'in_app' },
//       { type: 'email' },
//       { type: 'push' }
//     ],
//     expiresAt: new Date(scheduledFor.getTime() + 30 * 60 * 1000) // 30 minutes after meeting
//   });
// };

// // Static method to create recording ready notification
// NotificationSchema.statics.createRecordingReady = function(recipientId, recordingId, meetingTitle) {
//   return this.create({
//     recipient: recipientId,
//     type: 'recording_ready',
//     title: 'Recording Ready',
//     message: `Recording for "${meetingTitle}" is now available`,
//     data: {
//       recordingId,
//       actionUrl: `/recordings/${recordingId}`
//     },
//     priority: 'normal',
//     deliveryChannels: [
//       { type: 'in_app' },
//       { type: 'email' }
//     ]
//   });
// };

// module.exports = mongoose.model('Notification', NotificationSchema); 