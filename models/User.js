const { timeStamp } = require('console');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: false ,unique :true},
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    otp: { type: String },
    otpExpiry: { type: Date },
    socketId: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    profilePic: { type: String },
    status: { type: String },
    coverPic: { type: String },
    about: { type: String },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    password : { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);