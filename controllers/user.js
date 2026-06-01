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

    const { firstName, lastName } = req.body;

    User.findByIdAndUpdate(userId, { firstName, lastName }, { new: true })
    .then(updatedUser => res.status(200).send(updatedUser))
    .catch(error => errorHandler(error, req, res)); 
}