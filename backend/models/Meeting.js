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
