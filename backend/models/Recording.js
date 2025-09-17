    const mongoose = require('mongoose');
    
    const RecordingSchema = new mongoose.Schema({
      meeting: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Meeting', 
        required: true,
        index: true,
      },
      recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      title: { type: String, required: true },
      cloudinaryUrl: {
        type: String,
        required: true,
      },
      cloudinaryPublicId: {
        type: String,
        required: true,
      },
      duration: { // Duration in seconds
        type: Number, 
        default: 0,
        required: true
      },
      fileSize: { // Size in bytes
        type: Number, 
        default: 0,
      },
      captionUrl: {
        type: String,
        default: null,
      },
      captionPublicId: {
        type: String,
      },

    }, { timestamps: true });
    
    module.exports = mongoose.model('Recording', RecordingSchema);