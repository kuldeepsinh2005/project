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
  getMeetingDetails
} = require('../controllers/meetings.js');

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

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const {
//   createMeeting,
//   getMeeting,
//   joinMeeting,
//   leaveMeeting,
//   endMeeting,
//   findMeeting
// } = require('../controllers/meetings');
// const { verifyJWT } = require('../middleware/auth');

// // All routes require authentication
// router.post('/create', verifyJWT, createMeeting);
// router.get('/:meetingId', verifyJWT, getMeeting);
// router.post('/:meetingId/join', verifyJWT, joinMeeting);
// router.post('/:meetingId/leave', verifyJWT, leaveMeeting);
// router.post('/:meetingId/end', verifyJWT, endMeeting);
// router.get('/find/:meetingId', verifyJWT, findMeeting);

// module.exports = router;



// // backend/routes/meetings.js
// const express = require('express');
// const router = express.Router();
// const { createMeeting, getMeeting, joinMeeting } = require('../controllers/meetings');

// // verifyJWT exists in your middleware; creating meeting/joining can be allowed for authenticated users.
// // If you want public create/join, remove the middleware.
// const { verifyJWT } = require('../middleware/auth');

// // create meeting (authenticated recommended)
// router.post('/', verifyJWT, createMeeting);

// // get meeting info (public)
// router.get('/:id', getMeeting);

// // join meeting (authenticated recommended, but optional)
// router.post('/join', verifyJWT, joinMeeting);

// module.exports = router;


// const express = require('express');
// const {
//   createMeeting,
//   joinMeeting,
//   getMeeting,
//   endMeeting,
//   getUserMeetings
// } = require('../controllers/meetings');
// const { protect } = require('../middleware/auth');

// const router = express.Router();

// router.route('/')
//   .post(protect, createMeeting);

// router.route('/:meetingId/join')
//   .put(protect, joinMeeting);

// router.route('/:meetingId')
//   .get(protect, getMeeting)
//   .put(protect, endMeeting);

// router.route('/user/:userId')
//   .get(protect, getUserMeetings);

// module.exports = router;