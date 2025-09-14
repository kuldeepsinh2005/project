const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { upload } = require('../middleware/multer');
const { uploadRecording, getUserRecordings,deleteRecording } = require('../controllers/recordings');
const { asyncHandler } = require('../utils/asyncHandler');

// POST /api/recordings/:meetingCode/upload
router.post(
    '/:meetingCode/upload', 
    verifyJWT, 
    upload.single('recording'), // Middleware to accept a single file named 'recording'
    asyncHandler(uploadRecording)
);

// GET /api/recordings
router.get(
    '',
    verifyJWT,
    asyncHandler(getUserRecordings)
);
router.delete(
    '/:meetingCode',
    verifyJWT,
    asyncHandler(deleteRecording)
);

module.exports = router;
