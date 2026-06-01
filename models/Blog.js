const mongoose = require('mongoose');


const blogSchema = new mongoose.Schema({

	title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        fullName: { type: String }
    },
    creationDate: {
      type: Date,
      default: Date.now,
    },
    comments: [
        {
           userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            userName: { type: String },
            comment: {
                type: String,
                required: true
            }
        }
    ]
    })



module.exports = mongoose.model('Blog', blogSchema);