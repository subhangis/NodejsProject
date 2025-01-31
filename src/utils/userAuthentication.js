const jwt = require('jsonwebtoken');
require('dotenv').config(); // Make sure you have the .env file for the SECRET_KEY

// Middleware to verify the user
const verifyUser = (req, res, next) => {
    // 1. Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // 2. If no token is provided
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // 3. Verify the token using the SECRET_KEY
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // 4. Attach the user information (decoded payload) to the request object
        req.user = decoded;

        // 5. Proceed to the next middleware or controller
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired token." });
    }
};

module.exports = verifyUser;
