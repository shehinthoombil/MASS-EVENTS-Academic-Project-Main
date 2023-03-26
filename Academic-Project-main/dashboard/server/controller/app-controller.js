import jwt from 'jsonwebtoken';
import Staff from "../schema/staff-schema.js";
import Event from "../schema/event-schema.js";

const getCurrentUser = async (jwtToken) => {
    const tokenDecoded = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const currentStaff = await Staff.findById(tokenDecoded.userID).select('-password');
    return currentStaff;
}

const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return (yyyy + '-' + mm + '-' + dd);
}

export const getNewEvents = async (req, res) => {
    try {
        const getFormattedToday = getToday();
        const newEvents = await Event.find({ date: { 
            $gte: getFormattedToday } 
        }).sort({ date: 1, time: 1 });
        res.status(200).json(newEvents);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const bookEvent = async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req.cookies.jwt);
        const datas = await req.body;
        const alreadyBooked = await Event.find({
            bookings: {
                $all: [ currentUser._id.toString() ]
            }, date: datas.date
        });
        if(alreadyBooked.length === 0) {
            await Event.findOneAndUpdate({
                _id: datas.event,
            }, {
                    $addToSet: {
                        bookings: currentUser._id.toString()
                    },
                }
            );
            res.status(201).send({ "status": "success", "message": "Booked event successfully" });
        } else {
            res.status(201).send({ "status": "failed", "message": "Already booked an event on this date" });
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getBookings = async (req, res) => {
    const currentUser = await getCurrentUser(req.cookies.jwt);
    try {
        const getFormattedToday = getToday();
        const events = await Event.find({ date: getFormattedToday }).populate('bookings').sort({ time: 1 });
        const duty = [];
        events.map((event) => {
            (currentUser.attendanceduty.includes(event._id)) && duty.push(event);
        });
        res.status(200).json(duty);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const markAttendance = async (req, res) => {
    try {
        const datas = await req.body;
        const currentStaff = await Staff.findOne({ _id: datas.staff }).select('-password');
        await Event.findOneAndUpdate({
            _id: datas.event,
        },
            {
                $addToSet: {
                    attendance: currentStaff._id.toString(),
                },
            }
        );
        res.status(201).send({ "status": "success", "message": "Marked attendance successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const cancelAttendance = async (req, res) => {
    try {
        const datas = await req.body;
        const currentStaff = await Staff.findOne({ _id: datas.eventName.staff }).select('-password');
        const events = await Event.findOne({ _id: datas.eventName.event, "payments": currentStaff._id});
        if(!events) {
        await Event.findOneAndUpdate({
            _id: datas.eventName.event,
        },
            {
                $pull: {
                    attendance: currentStaff._id.toString(),
                },
            }
        );
        res.status(201).send({ "status": "success", "message": "Cancelled attendance successfully" });
        } else {
            res.send({ "status": "failed", "message": "Can't cancel attendance" });
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getEventsStatus = async (req, res) => {
    const currentStaff = await getCurrentUser(req.cookies.jwt);
    try {
        const events = await Event.find({
            bookings: {
                $all: [ currentStaff._id.toString() ]
            },
        }).sort({ date: -1, time: -1 });
        res.status(200).send({ "events": events, "user": currentStaff._id });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPayments = async (req, res) => {
    const currentStaff = await getCurrentUser(req.cookies.jwt);
    try {
        const paidEvents = await Event.find({
            attendance: {
                $all: [ currentStaff._id.toString() ] 
            },
        }).sort({ date: -1, time: -1 });
        res.status(200).send({ "paidEvents": paidEvents, "staff": { 
            "staffId": currentStaff._id, 
            "payment": currentStaff.wage 
        } });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}