const express = require("express");
const {
  createUser,
  getUsers,
  loginUser,
  uploadDocuments,
  fetch,
  upload,
} = require("../src/controller/userController");
const verifyUser = require("../src/utils/userAuthentication");

const routes = express.Router();

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: Fetch API status
 *     description: Returns a success message indicating the API is working.
 *     responses:
 *       200:
 *         description: API is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API is running"
 */
routes.get("/api/v1", fetch);

/**
 * @swagger
 * /api/v1/User:
 *   post:
 *     summary: Create a new user
 *     description: Registers a new user in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request payload
 */
routes.post("/api/v1/User", createUser);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all registered users.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *       401:
 *         description: Unauthorized access
 */
routes.get("/api/v1/users", verifyUser, getUsers);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
routes.post("/api/v1/login", loginUser);

/**
 * @swagger
 * /api/v1/upload:
 *   post:
 *     summary: Upload user documents
 *     description: Allows users to upload multiple documents (max 10).
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: Invalid file format
 */
routes.post("/api/v1/upload", upload.array("documents", 10), uploadDocuments);

module.exports = routes;
