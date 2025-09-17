// backend/routes/meetings.js
const express = require('express');
const router = express.Router();
const ErrorResponse = require('../utils/errorResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { verifyJWT } = require('../middleware/auth.js');
const {
  createMeeting,
  joinMeeting,
  leaveMeeting,
  removeParticipant,
  endMeeting,
  getMeetingDetails,
  getUserHostedMeetings,
  getUserParticipatedMeetings
} = require('../controllers/meetings.js');

// router.get('/my-meetings', verifyJWT, asyncHandler(getUserMeetings));

// @route   POST /api/meetings
// @desc    Create a new meeting (host only)
// @access  Private
router.post('/', verifyJWT, asyncHandler(createMeeting));

// @route   POST /api/meetings/:id/join
// @desc    Join a meeting
// @access  Private
router.post('/:id/join', verifyJWT, asyncHandler(joinMeeting));

// @route   POST /api/meetings/:id/leave
// @desc    Leave a meeting
// @access  Private
router.post('/:id/leave', verifyJWT, asyncHandler(leaveMeeting));

// @route   DELETE /api/meetings/:id/participants/:participantId
// @desc    Remove a participant (host only)
// @access  Private
router.delete('/:id/participants/:participantId', verifyJWT, asyncHandler(removeParticipant));

// @route   DELETE /api/meetings/:id
// @desc    End a meeting (host only)
// @access  Private
router.delete('/:id', verifyJWT, asyncHandler(endMeeting));

// @route   GET /api/meetings/:id
// @desc    Get meeting details
// @access  Private
router.get('/:id', verifyJWT, asyncHandler(getMeetingDetails));

// --- NEW: Separate routes for paginated meeting history ---
router.get('/my-meetings/hosted', verifyJWT, getUserHostedMeetings);
router.get('/my-meetings/participated', verifyJWT, getUserParticipatedMeetings);


module.exports = router;

