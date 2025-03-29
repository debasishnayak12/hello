const jwt = require("jsonwebtoken");

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15d" });
};


const User = require("../models/User");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ status: false, message: "Not authorized to access." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        console.log("verify user :",user);
        if (!user) {
            return res.status(401).json({ status: false, message: "User not found." });
        }

        if (decoded.id != user._id) {
            return res.status(403).json({ status: false, message: "Invalid token. Please log in again." });
        }

        req.user = user; 
        next(); 

    } catch (err) {
        return res.status(403).json({ status: false, message: "Invalid or expired token." });
    }
};




module.exports = { createToken, verifyToken };