const Meeting = require('../models/Meeting');
const ErrorResponse = require('../utils/errorResponse');

const generateMeetingCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

exports.createMeeting = async (req, res, next) => {
    try {
        const {
            title
        } = req.body;
        if (!title) {
            return res.status(400).json({
                error: 'Title is required'
            });
        }
        const meeting = await Meeting.create({
            title,
            code: generateMeetingCode(),
            host: req.user._id,
            participants: [{
                user: req.user._id,
                joinedAt: Date.now(),
                leavedAt: null
            }],
            status: 'live',
        });
        res.status(201).json({
            success: true,
            data: {
                meetingId: meeting.code,
                title: meeting.title,
                status: meeting.status,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.joinMeeting = async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({
            code: req.params.id
        });
        if (!meeting) {
            return res.status(404).json({
                success: false,
                error: 'Meeting not found'
            });
        }
        if (meeting.status === 'ended') {
            return res.status(400).json({
                success: false,
                error: 'This meeting has already ended.'
            });
        }
        const participantIndex = meeting.participants.findIndex(p => p.user.toString() === req.user._id.toString());
        if (participantIndex > -1) {
            if (meeting.participants[participantIndex].leavedAt) {
                meeting.participants[participantIndex].joinedAt = Date.now();
                meeting.participants[participantIndex].leavedAt = null;
                await meeting.save();
            }
        } else {
            meeting.participants.push({
                user: req.user._id,
                joinedAt: Date.now(),
                leavedAt: null
            });
            await meeting.save();
        }
        const updatedMeeting = await Meeting.findById(meeting._id).populate('host', 'username').populate('participants.user', 'username');
        res.status(200).json({
            success: true,
            meeting: updatedMeeting
        });
    } catch (err) {
        next(err);
    }
};

exports.leaveMeeting = async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({
            code: req.params.id
        });
        if (!meeting) return next(new ErrorResponse('Meeting not found', 404));
        const participantIndex = meeting.participants.findIndex(p => p.user.toString() === req.user._id.toString());
        if (participantIndex > -1 && !meeting.participants[participantIndex].leavedAt) {
            meeting.participants[participantIndex].leavedAt = Date.now();
            await meeting.save();
        }
        res.status(200).json({
            success: true,
            meeting
        });
    } catch (err) {
        next(err);
    }
};

exports.removeParticipant = async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({
            code: req.params.id
        });
        if (!meeting) return next(new ErrorResponse('Meeting not found', 404));
        if (meeting.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Only the host can remove participants'
            });
        }
        meeting.participants = meeting.participants.filter(p => p.user.toString() !== req.params.participantId);
        await meeting.save();
        res.status(200).json({
            success: true,
            meeting
        });
    } catch (err) {
        next(err);
    }
};

exports.endMeeting = async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({
            code: req.params.id
        });
        if (!meeting) return next(new ErrorResponse('Meeting not found', 404));
        if (meeting.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Only the host can end the meeting'
            });
        }
        const endedAtTime = Date.now();
        meeting.status = 'ended';
        meeting.endedAt = endedAtTime;
        meeting.participants.forEach(participant => {
            if (!participant.leavedAt) {
                participant.leavedAt = endedAtTime;
            }
        });
        await meeting.save();
        res.status(200).json({
            success: true,
            message: 'Meeting ended successfully'
        });
    } catch (err) {
        next(err);
    }
};

exports.getMeetingDetails = async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({
                code: req.params.id
            })
            .populate('host', 'username email firstName lastName')
            .populate('participants.user', 'username email firstName lastName');
        if (!meeting) {
            return next(new ErrorResponse('Meeting not found', 404));
        }
        res.status(200).json({
            success: true,
            meeting
        });
    } catch (err) {
        next(err);
    }
};

// --- This function is now split into two new functions below ---
// exports.getUserMeetings = ...

// --- NEW: Paginated function for HOSTED meetings ---
exports.getUserHostedMeetings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 3;
        const skip = (page - 1) * limit;

        const query = { host: userId };

        const totalMeetings = await Meeting.countDocuments(query);
        const totalPages = Math.ceil(totalMeetings / limit);

        const meetings = await Meeting.find(query)
            .populate('host', 'username')
            .populate('participants.user', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({ success: true, data: meetings, currentPage: page, totalPages });
    } catch (err) {
        next(err);
    }
};

// --- NEW: Paginated function for PARTICIPATED meetings ---
exports.getUserParticipatedMeetings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 3;
        const skip = (page - 1) * limit;

        // Find meetings where the user is a participant but NOT the host
        const query = { 
            'participants.user': userId,
            host: { $ne: userId } 
        };

        const totalMeetings = await Meeting.countDocuments(query);
        const totalPages = Math.ceil(totalMeetings / limit);

        const meetings = await Meeting.find(query)
            .populate('host', 'username')
            .populate('participants.user', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({ success: true, data: meetings, currentPage: page, totalPages });
    } catch (err) {
        next(err);
    }
};




// exports.getUserMeetings = async (req, res, next) => {
//   try {
//     const userId = req.user._id;

//     // Get pagination parameters from query, with defaults
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 6; // We'll show 6 meetings per page
//     const skip = (page - 1) * limit;

//     const query = {
//       $or: [
//         { host: userId },
//         { 'participants.user': userId }
//       ]
//     };

//     // Get the total count of meetings to calculate total pages
//     const totalMeetings = await Meeting.countDocuments(query);
//     const totalPages = Math.ceil(totalMeetings / limit);

//     // Fetch the paginated data from the database
//     const meetings = await Meeting.find(query)
//       .populate('host', 'username')
//       .populate('participants.user', 'username')
//       .sort({ createdAt: -1 }) // Show the most recent meetings first
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({ 
//         success: true, 
//         count: meetings.length, 
//         totalPages,
//         currentPage: page,
//         totalMeetings, // Send total count to frontend
//         data: meetings 
//     });

//   } catch (err) {
//     next(err);
//   }
// };

