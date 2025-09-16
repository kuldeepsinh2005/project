const Recording = require('../models/Recording');
const Meeting = require('../models/Meeting');
const cloudinary = require('cloudinary').v2;
const { transcribeWithWhisper } = require('../utils/transcribeWithWhisper');
const path = require('path');
const fs = require('fs');
const { uploadOnCloudinary } = require('../config/cloudinary');
const { convertWebmToWav } = require('../utils/convertAudio');

const safeDelete = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('[Cleanup Warning] Could not delete:', filePath, err.message);
    }
  }
};


// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadRecording = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.meetingCode });
    if (!meeting) return res.status(404).json({ success: false, error: 'Meeting not found' });

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the host can upload recordings.' });
    }

    const { title, duration } = req.body;
    if (!req.file || !title || !duration) {
      return res.status(400).json({ success: false, error: 'Missing fields or file.' });
    }

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 1: Save the .webm file
    const tempWebmPath = path.join(tempDir, `${Date.now()}.webm`);
    fs.writeFileSync(tempWebmPath, req.file.buffer);

    if (!fs.existsSync(tempWebmPath)) {
      throw new Error("Failed to save video file");
    }

    // Step 2: Convert .webm to .wav
    const tempWavPath = tempWebmPath.replace('.webm', '.wav');
    await convertWebmToWav(tempWebmPath, tempWavPath);

    // Step 3: Transcribe .wav using Whisper
    const vttPath = await transcribeWithWhisper(tempWavPath); // output will be .vtt

    // Step 4: Upload .webm to Cloudinary
    const videoResult = await uploadOnCloudinary(tempWebmPath);
    if (!videoResult) throw new Error("Video upload failed");

    // Step 5: Upload .vtt to Cloudinary
    const captionResult = await cloudinary.uploader.upload(vttPath, {
      resource_type: 'raw',
      folder: 'cosmo-meet/captions',
      public_id: videoResult.public_id + '_captions'
    });

    // Step 6: Save metadata to MongoDB
    const newRecording = new Recording({
      meeting: meeting._id,
      recordedBy: req.user._id,
      title,
      duration: parseInt(duration),
      cloudinaryUrl: videoResult.secure_url,
      cloudinaryPublicId: videoResult.public_id,
      fileSize: videoResult.bytes,
      captionUrl: captionResult.secure_url,
    });

    await newRecording.save();

    // Step 7: Cleanup

    safeDelete(tempWebmPath);
    safeDelete(tempWavPath);
    safeDelete(vttPath);

    res.status(201).json({ success: true, data: newRecording });

  } catch (err) {
    console.error("Upload failed:", err);
    next(err);
  }
};

exports.getUserRecordings = async (req, res, next) => {
  try {
    // console.log(req.user._id);
    const recordings = await Recording.find({ recordedBy: req.user._id })
      .populate('meeting', 'title code') // Populate related meeting info
      .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json({ success: true, count: recordings.length, data: recordings });
  } catch (err) {
    next(err);
  }
};

// --- NEW FUNCTION ---
// @desc    Delete a recording
// @route   DELETE /api/recordings/:meetingCode
// @access  Private
exports.deleteRecording = async (req, res, next) => {
  try {
    const recording = await Recording.findById(req.params.meetingCode);
    // console.log(req.params.meetingCode," ",recording);
    if (!recording) {
      return res.status(404).json({ success: false, error: 'Recording not found' });
    }

    // Ensure the user deleting the recording is the one who created it
    if (recording.recordedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this recording.' });
    }

    // Step 1: Delete the video file from Cloudinary
    await cloudinary.uploader.destroy(recording.cloudinaryPublicId, { resource_type: 'video' });

    // Step 2: Delete the recording metadata from the database
    await recording.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

