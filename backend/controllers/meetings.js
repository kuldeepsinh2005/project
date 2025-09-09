
const Meeting = require('../models/Meeting');
const ErrorResponse = require('../utils/errorResponse');

// Generate meeting code
const generateMeetingCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// @desc Create a new meeting
exports.createMeeting = async (req, res, next) => {
  console.log("Create meeting endpoint hit");
  try {
    const { title } = req.body;
    console.log("Request body:", req.body);

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const meeting = await Meeting.create({
      title,
      code: generateMeetingCode(),
      host: req.user._id,
      participants: [{ user: req.user._id }],
      status: 'live',
    });

    console.log("Meeting created:", meeting);

    res.status(201).json({
      success: true,
      data: {
        meetingId: meeting.code,
        title: meeting.title,
        status: meeting.status,
      },
    });
  } catch (err) {
    console.error("Error creating meeting:", err);
    next(err);
  }
};


// @desc Join a meeting
exports.joinMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.id });
    if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

    // Updated check to send a direct JSON response
    if (meeting.status === 'ended') {
      return res.status(400).json({ success: false, error: 'This meeting has been ended by the host' });
    }

    const participantIndex = meeting.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex > -1) {
      if (meeting.participants[participantIndex].leavedAt) {
        meeting.participants[participantIndex].joinedAt = Date.now();
        meeting.participants[participantIndex].leavedAt = undefined;
      } else {
        return res.status(400).json({ error: 'You are already in this meeting' });
      }
    } else {
      meeting.participants.push({ user: req.user._id });
    }

    await meeting.save();
    res.status(200).json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};

// @desc Leave a meeting
exports.leaveMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.id });
    if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

    const participantIndex = meeting.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex > -1) {
      meeting.participants[participantIndex].leavedAt = Date.now();
      await meeting.save();
    }

    res.status(200).json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};


// @desc Remove a participant (host only)
exports.removeParticipant = async (req, res, next) => {
  try {
    // Corrected: Find meeting by unique code instead of _id
    const meeting = await Meeting.findOne({ code: req.params.id });
    if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can remove participants' });
    }

    meeting.participants = meeting.participants.filter(
      p => p.user.toString() !== req.params.participantId // Note: check your route for this param name
    );
    await meeting.save();

    res.status(200).json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};

// @desc End a meeting (host only)
exports.endMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ code: req.params.id });
    if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the host can end the meeting' });
    }

    const endedAtTime = Date.now();
    meeting.status = 'ended';
    meeting.endedAt = endedAtTime;

    // --- NEW LOGIC ---
    // Iterate over participants and set `leavedAt` for anyone still in the meeting.
    meeting.participants.forEach(participant => {
      if (!participant.leavedAt) {
        participant.leavedAt = endedAtTime;
      }
    });
    // --- END OF NEW LOGIC ---

    await meeting.save();

    res.status(200).json({ success: true, message: 'Meeting ended successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc Get meeting details
exports.getMeetingDetails = async (req, res, next) => {
  try {
    // Corrected: Find meeting by unique code instead of _id
    const meeting = await Meeting.findOne({ code: req.params.id })
      .populate('host', 'username email firstName lastName')
      .populate('participants.user', 'username email firstName lastName');

    if (!meeting) {
      return next(new ErrorResponse('Meeting not found', 404));
    }

    res.status(200).json({ success: true, meeting });
  } catch (err) {
    next(err);
  }
};

exports.getUserMeetings = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const meetings = await Meeting.find({
      $or: [
        { host: userId },
        { 'participants.user': userId }
      ]
    })
    .populate('host', 'username')
    .populate('participants.user', 'username')
    .sort({ createdAt: -1 });

    if (!meetings) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, count: meetings.length, data: meetings });

  } catch (err) {
    next(err);
  }
};

// //meetings.js controller
// Meeting = require('../models/Meeting');
// const ErrorResponse = require('../utils/errorResponse');

// // Generate meeting code
// const generateMeetingCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// // @desc Create a new meeting
// exports.createMeeting = async (req, res, next) => {
//   console.log("Create meeting endpoint hit");
//   try {
//     const { title } = req.body;
//     console.log("Request body:", req.body);
//     // console.log("User from token:", req.user);

//     if (!title) {
//       return res.status(400).json({ error: 'Title is required' });
//     }

//     const meeting = await Meeting.create({
//       title,
//       code: generateMeetingCode(),
//       host: req.user._id,
//       participants: [{ user: req.user._id }],
//       status: 'live',
//     });

//     console.log("Meeting created:", meeting);

//     res.status(201).json({
//       success: true,
//       data: {
//         meetingId: meeting.code,
//         title: meeting.title,
//         status: meeting.status,
//       },
//     });
//   } catch (err) {
//     console.error("Error creating meeting:", err);
//     next(err);
//   }
// };


// // @desc Join a meeting
// exports.joinMeeting = async (req, res, next) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

//     const alreadyJoined = meeting.participants.some(
//       p => p.user.toString() === req.user._id.toString()
//     );
//     if (alreadyJoined) {
//       return res.status(400).json({ error: 'You have already joined this meeting' });
//     }

//     meeting.participants.push({ user: req.user._id });
//     await meeting.save();

//     res.status(200).json({ success: true, meeting });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc Leave a meeting
// exports.leaveMeeting = async (req, res, next) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

//     meeting.participants = meeting.participants.filter(
//       p => p.user.toString() !== req.user._id.toString()
//     );
//     await meeting.save();

//     res.status(200).json({ success: true, meeting });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc Remove a participant (host only)
// exports.removeParticipant = async (req, res, next) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

//     if (meeting.host.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Only the host can remove participants' });
//     }

//     meeting.participants = meeting.participants.filter(
//       p => p.user.toString() !== req.params.userId
//     );
//     await meeting.save();

//     res.status(200).json({ success: true, meeting });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc End a meeting (host only)
// exports.endMeeting = async (req, res, next) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id);
//     if (!meeting) return next(new ErrorResponse('Meeting not found', 404));

//     if (meeting.host.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Only the host can end the meeting' });
//     }

//     meeting.status = 'ended';
//     meeting.endedAt = Date.now();
//     await meeting.save();

//     res.status(200).json({ success: true, message: 'Meeting ended successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc Get meeting details
// exports.getMeetingDetails = async (req, res, next) => {
//   try {
//     const meeting = await Meeting.findById(req.params.id)
//       .populate('host', 'username email firstName lastName')
//       .populate('participants.user', 'username email firstName lastName');

//     if (!meeting) {
//       return next(new ErrorResponse('Meeting not found', 404));
//     }

//     res.status(200).json({ success: true, meeting });
//   } catch (err) {
//     next(err);
//   }
// };
