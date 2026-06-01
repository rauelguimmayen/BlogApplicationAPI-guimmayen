const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

const { verify, validateEmail } = require("../auth");

// POST /users/register
router.post("/register", validateEmail, userController.registerUser);

// POST /users/login
router.post("/login", userController.loginUser);

// GET /users/details
router.get("/details", verify, userController.getProfile);

// PUT /users/profile
router.put('/profile', verify, userController.updateProfile);

module.exports = router;