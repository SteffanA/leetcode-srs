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
        required: false,
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
        /*
        Stores:
        when a user will next need to solve a problem
        submissions to said problem
        Lifetime results to said problem
        */
        {
            // Store the time of the next required submission/attempt
            next_submission: {
                type: Date,
                default: Date.now,
                required: true,
            },
            // Store the current interval in days
            interval: {
                type: Number,
                default: 1,
                required: true
            },
            // Store the lifetime results for the problem
            // Success is a correct submission
            // Incorrect is an incorrect submission
            results: {
                success: {
                    type: Number,
                    required: true,
                    default: 0,
                },
                incorrect: {
                    type: Number,
                    required: true,
                    default: 0,
                }
            },
            // Submissions on this particular problem
            submissions: [
                {
                    submission: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'submissions',
                    },
                },
            ],
            // Link to a specific problem
            problem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'problem',
                required: true,
            },
        }
    ]
})

module.exports = User = mongoose.model('user', UserSchema)