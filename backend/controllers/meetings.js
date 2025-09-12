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

exports.getUserMeetings = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const meetings = await Meeting.find({
                $or: [{
                        host: userId
                    },
                    {
                        'participants.user': userId
                    }
                ]
            })
            .populate('host', 'username')
            .populate('participants.user', 'username')
            .sort({
                createdAt: -1
            });
        res.status(200).json({
            success: true,
            count: meetings.length,
            data: meetings
        });
    } catch (err) {
        next(err);
    }
};
