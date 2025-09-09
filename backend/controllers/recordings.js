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
      { resource_type: 'video' },
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



// const Recording = require('../models/Recording');
// const Meeting = require('../models/Meeting');
// const { uploadOnCloudinary } = require('../config/cloudinary');
// const ErrorResponse = require('../utils/errorResponse');

// // @desc    Upload a meeting recording
// // @route   POST /api/recordings/:meetingCode/upload
// // @access  Private (Host only)
// exports.uploadRecording = async (req, res, next) => {
//     try {
//         const { meetingCode } = req.params;
//         const meeting = await Meeting.findOne({ code: meetingCode });

//         if (!meeting) {
//             return next(new ErrorResponse('Meeting not found', 404));
//         }

//         // Security check: Only the host can upload recordings
//         if (meeting.host.toString() !== req.user._id.toString()) {
//             return next(new ErrorResponse('Only the host can upload recordings', 403));
//         }

//         const localFilePath = req.file?.path;
//         if (!localFilePath) {
//             return next(new ErrorResponse('No recording file received', 400));
//         }

//         const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

//         if (!cloudinaryResponse) {
//             return next(new ErrorResponse('Failed to upload recording to cloud', 500));
//         }

//         const recording = await Recording.create({
//             meeting: meeting._id,
//             recordedBy: req.user._id,
//             cloudinaryUrl: cloudinaryResponse.secure_url,
//             cloudinaryPublicId: cloudinaryResponse.public_id,
//             duration: cloudinaryResponse.duration,
//             fileSize: cloudinaryResponse.bytes,
//         });

//         res.status(201).json({ success: true, data: recording });

//     } catch (err) {
//         next(err);
//     }
// };

// // @desc    Get all recordings for a meeting
// // @route   GET /api/recordings/:meetingCode
// // @access  Private
// exports.getRecordingsForMeeting = async (req, res, next) => {
//     try {
//         const { meetingCode } = req.params;
//         const meeting = await Meeting.findOne({ code: meetingCode });

//         if (!meeting) {
//             return next(new ErrorResponse('Meeting not found', 404));
//         }

//         const recordings = await Recording.find({ meeting: meeting._id })
//             .sort({ createdAt: -1 });

//         res.status(200).json({ success: true, count: recordings.length, data: recordings });

//     } catch (err) {
//         next(err);
//     }
// };
