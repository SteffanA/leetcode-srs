/*
Defines schema for our User model
*/
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    // User's name
    name: {
        type: String,
        required: true,
    },
    // User's email address
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // Hashed password
    password: {
        type: String,
        required: true,
    },
    // Date user created their account
    creationDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    // Lists this user has associated with themself.
    // These lists may or may not be public
    lists: [
        {
            list: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'lists',
            }
        }
    ],
    // Status of problems this user has done
    problem_statuses: [
        {
            problem_status: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'problem_status'
            }
        }
    ]
})

module.exports = User = mongoose.model('user', UserSchema)