const User = require('../models/User');
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { createAccessToken, errorHandler } = require("../auth");
const jwt = require('jsonwebtoken');


// User Registration
module.exports.registerUser = (req, res) => {

    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: "Invalid email format" });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ message: "Password must be atleast 8 characters long" });
    } else {

        let newUser = new User({
            userName: req.body.userName,
            email : req.body.email,
            password : bcrypt.hashSync(req.body.password, 10)
        });

        return newUser.save()
        .then((result) => res.status(201).send({ message: "Registered successfully" }))
        .catch(error => {
            if(error.code === 11000){
                res.status(409).send({ message: 'Duplicate Email Exist' });
            } else {
                res.status(500).send({ error: error.message });
            }
        });
    }
};

// User Login
module.exports.loginUser = (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(400).send({ error: "Username and password are required" });
    }

    User.findOne({ userName })
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).send({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { 
                id: user._id,
                userName: user.userName,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.status(200).send({ access: token });
    })
    .catch(error => errorHandler(error, req, res));
};

// User getProfile
module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .select('-password')
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        return res.status(200).send(user);
    })
    .catch(error => errorHandler(error, req, res));
};

// User can add their First and Last name

module.exports.updateProfile = async (req, res) => {

    const userId = req.user.id;

    const { firstName, lastName, email } = req.body;

    User.findByIdAndUpdate(userId, { firstName, lastName, email }, { new: true })
    .then(updatedUser => res.status(200).send(updatedUser))
    .catch(error => errorHandler(error, req, res)); 
}

module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Ensure new password is present
    if (!newPassword) {
      return res.status(400).json({
        error: { message: "New password is required"}
      });
    }

    // Enforce minimum password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: { message: "New password must be at least 8 characters long"}
      });
    }

    // Get user id from the Bearer token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: { message: "User not found"}
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: { message: err.message }
    });
  }

};