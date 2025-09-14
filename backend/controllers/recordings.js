const Recording = require('../models/Recording');
const Meeting = require('../models/Meeting');
const cloudinary = require('cloudinary').v2;

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadRecording = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.meetingCode });
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the host can upload recordings.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No recording file provided.' });
    }

    // Capture metadata from the multipart form data
    const { title, duration } = req.body;
    if (!title || !duration) {
        return res.status(400).json({ success: false, error: 'Title and duration are required.' });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'video',
        // --- CHANGE: Added folder option ---
        folder: 'cosmo-meet' 
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return res.status(500).json({ success: false, error: 'Failed to upload to Cloudinary.' });
        }

        // Create a new recording document with all the rich metadata
        const newRecording = new Recording({
          meeting: meeting._id,
          recordedBy: req.user._id,
          title: title,
          duration: parseInt(duration, 10),
          cloudinaryUrl: result.secure_url,
          cloudinaryPublicId: result.public_id,
          fileSize: result.bytes,
        });

        await newRecording.save();
        res.status(201).json({ success: true, data: newRecording });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (err) {
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


