const jwt = require("jsonwebtoken");
require('dotenv').config();

// Create Access Token
module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        userName: user.userName,
        email: user.email,
        isAdmin: user.isAdmin
    };
    
    return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
}

// Verify Token
module.exports.verify = (req, res, next) => {
    console.log(req.headers.authorization);
    let token = req.headers.authorization;

    if(typeof token === "undefined") {
        return res.send({ auth: "Failed. No Token" });
    } else {
        console.log(token);
        // Bearer asdgasd123.ajsdgasd12.asdasdasd
        token = token.slice(7, token.length);
        console.log(token);
        // asdgasd123.ajsdgasd12.asdasdasd

        jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken) {
            if(err) {
                return res.status(403).send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                console.log("result from verify method " + decodedToken);
                // decodedToken contains: id, email, isAdmin
                req.user = decodedToken;
                next();
            }
        })
    }
}

// Verify Admin
module.exports.verifyAdmin = (req, res, next) => {
    console.log("result from verifyAdmin: " + req.user);
    if(req.user.isAdmin) {
        next();
    } else {
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden"
        });
    }
}

// Error Handler
module.exports.errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
}

// Check if Logged In (Session-based)
module.exports.isLoggedIn = (req, res, next) => {
    try {
        if(req.session && req.session.user) {
            return next();
        }
        return res.status(401).json({
            message: "Unauthorized. Please log in first."
        });
    } catch(error) {
        return res.status(500).json({
            message: "Server error while checking authentication.",
            error: error.message
        });
    }
};

// Email Validation Middleware
module.exports.validateEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required." });
    }

    const trimmed = email.trim();

    if (trimmed.length > 254) {
      return res.status(400).json({ error: "Email is too long." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    req.body.email = trimmed; // normalize before it hits the route
    next();
  } 


module.exports.verifyNotAdmin = (req, res, next) => {
    if(req.user.isAdmin) {
        return res.status(403).send({ message: "Admins are not allowed to perform this action" });
    }
    next();
};