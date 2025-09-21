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
      captionPublicId: captionResult.public_id, 
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
    const userId = req.user._id;

    // Get pagination parameters from the query string
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6; // Set limit to 6 recordings per page
    const skip = (page - 1) * limit;

    const query = { recordedBy: userId };

    // Get the total count of recordings for pagination UI
    const totalRecordings = await Recording.countDocuments(query);
    const totalPages = Math.ceil(totalRecordings / limit);

    // Fetch the paginated recordings
    const recordings = await Recording.find(query)
      .populate('meeting', 'title code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recordings.length,
      totalPages,
      currentPage: page,
      totalRecordings,
      data: recordings,
    });
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
    if (!recording) {
      console.log("[Delete] Recording not found in DB");
      return res.status(404).json({ success: false, error: 'Recording not found' });
    }

    if (recording.recordedBy.toString() !== req.user._id.toString()) {
      console.log("[Delete] Unauthorized attempt by user:", req.user._id);
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this recording.' });
    }

    // Step 1: Delete video from Cloudinary
    console.log("[Delete] Attempting to delete video from Cloudinary:", recording.cloudinaryPublicId);
    const videoDeleteResult = await cloudinary.uploader.destroy(recording.cloudinaryPublicId, {
      resource_type: 'video'
    });
    console.log("[Delete] Video delete result:", videoDeleteResult);

    // Step 2: Delete caption from Cloudinary
    const captionPublicId = `cosmo-meet/captions/${recording.cloudinaryPublicId}_captions`;
    console.log("[Delete] Attempting to delete caption from Cloudinary:", captionPublicId);

    const captionDeleteResult = await cloudinary.uploader.destroy(captionPublicId, {
      resource_type: 'raw'
    });
    if (recording.captionPublicId) {
      const captionDeleteResult = await cloudinary.uploader.destroy(recording.captionPublicId, {
        resource_type: 'raw'
      });
      console.log("[Delete] Caption delete result:", captionDeleteResult);
    }


    // Step 3: Delete from MongoDB
    await recording.deleteOne();
    console.log("[Delete] Recording deleted from DB:", recording._id);

    res.status(200).json({ success: true, data: {} });

  } catch (err) {
    console.error("[Delete ERROR]", err);
    next(err);
  }
};
