const express = require('express');
const userController = require('../src/controller/userController');
const { createUser,getUsers,loginUser } = require('../src/controller/userController');
const verifyUser = require('../src/utils/userAuthentication');


const routes = express.Router();

// Use the correct function from userController
routes.get("/api/v1", userController.fetch);
routes.post("/api/v1/User", createUser);
//routes.get("/api/v1/users", getUsers); 
routes.post("/api/v1/login", loginUser);

// routes.use(verifyUser);  // Apply verifyUser middleware to all routes below this point

// Routes that require authentication
routes.get("/api/v1/users", verifyUser, getUsers);


module.exports = routes;