/*
Stores:
 when a user will next need to solve a problem
 submissions to said problem
 Lifetime results to said problem
*/
const mongoose = require('mongoose')

const ProblemStatusSchema = mongoose.Schema({
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
            }
        }
    ],
    // Note: I wanted to call this 'problem', but it looks like
    // that may be protected or something, because I could never
    // get it to validate until I changed the name
    /*
    Message was: 
    problem_status validation failed: problem: Path `problem` is required.
    TODO: Understand why the following schema didn't work
        type: mongoose.Schema.Types.ObjectId,
        ref: 'problems',
        required: true,
    */

    // Link to a specific problem - using the LC problem ID, not the document's
    prob: {
        type: Number,
        required: true,
    },
})

module.exports = ProblemStatus = mongoose.model('problem_status', ProblemStatusSchema)