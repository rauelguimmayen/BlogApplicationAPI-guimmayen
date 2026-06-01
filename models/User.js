const mongoose = require('mongoose');

	const userSchema = new mongoose.Schema({
		userName: {
			type: String,
			required: [true, 'Username is Required'],
			unique: true
		},
		firstName: {
			type: String,
		},	
		lastName: {
			type: String,
		},	
		email: {
			type: String,
			required: [true, 'Email is Required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
		},
		password: {
			type: String,
			required: [true, 'Password is Required'],
			minlength: [8, 'Password must be at least 8 characters long']
		},
		isAdmin: {
			type: Boolean,
			default: false
		}
        
	});

module.exports = mongoose.model('User', userSchema);