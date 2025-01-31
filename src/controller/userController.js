
const User = require('../model/userModel')
const {encryptPassword,decryptPassword} = require('../utils/crypto');
const {sendEmail} = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

require("dotenv").config();



 module.exports={
    fetch: (req,res)=>{
    res.send("Hello from getUser");
    }
 };


 module.exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email) {
            return res.status(400).json({ message: " Email is required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: " User already exists" });
        }

        const hashedPassword = await encryptPassword(password);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Send email notification
        await sendEmail(email, "Welcome!", `Hello ${name}, your account has been created.`);

        res.status(200).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ message: " Server error", error: error.message });
    }
};




module.exports.getUsers = async (req, res) => {
    try {
        const { id, name } = req.query; // Get query params from request

        let filter = {};

        // If ID is provided, fetch by ID
        if (id) {
            filter._id = id;
        }

        // If Name is provided, fetch by Name
        if (name) {
            filter.name = { $regex: name, $options: "i" }; // Case-insensitive search
        }

        const users = await User.find(filter);

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json({ message: "Users fetched successfully", users });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


//LOGIN API
module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔍 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email " });
        }

        // 🔑 2. Compare passwords using bcrypt
        let isMatch = decryptPassword(password,user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid  password" });
        }

        // 🏷️ 3. Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        //  4. Send response with user details and token
        res.status(200).json({ 
            message: "Login successful", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
