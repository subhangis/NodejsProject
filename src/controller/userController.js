const User = require('../model/userModel');
const { encryptPassword, decryptPassword } = require('../utils/crypto');
const { sendEmail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const fetch = (req, res) => {
    res.send("Hello from getUser");
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user with name, email, and password.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60a3b29f0c8f8c438c2f0a2a"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *       400:
 *         description: Bad Request (User already exists or missing fields)
 *       500:
 *         description: Server error
 */

const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await encryptPassword(password);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Send email notification
        await sendEmail(email, "Welcome!", `Hello ${name}, your account has been created.`);

        res.status(200).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get users based on query parameters
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []  // Reference to the security scheme defined above
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name (case-insensitive search)
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       404:
 *         description: No users found
 *       500:
 *         description: Server error
 */
const getUsers = async (req, res) => {
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
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate user and return token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 *     
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // Compare passwords using bcrypt
        let isMatch = decryptPassword(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Send response with user details and token
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


const storage = multer.diskStorage({
    
    destination: function (req, _File, cb) {
        const userEmail = req.body.email;
  console.log(req.body.documents)
        if (!userEmail) {
            return cb(new Error("Email ID is required"));
        }

   
        const userFolder = path.join('./upload', userEmail);
        // Check if folder exists, otherwise create it
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        } 
        cb(null, userFolder);
    },
    filename: function (_req, file, cb) {
        cb(null, Date.now());
    },
});

// Multer upload configuration
const upload = multer({ storage: storage });


/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload user documents
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files uploaded
 *       500:
 *         description: Server error
 */
const uploadDocuments = async (req, res) => {

    try {
        console.log('Files:', req.documents);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        // Creating response array
        const uploadedFiles = req.files.map((file) => ({
            documentName: file.originalname,
            documentLink: `/uploads/${req.body.email}/${file.filename}`,
        }));

        return res.status(200).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports = {
    fetch,
    createUser,
    getUsers,
    loginUser,
    uploadDocuments,
     upload, // Middleware for file handling
};
