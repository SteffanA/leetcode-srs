/*
Stores:
 when a user will next need to solve a problem
 submissions to said problem
 Lifetime results to said problem
*/
const mongoose = require('mongoose')

const ProblemStatusSchema = mongoose.Schema({
    // Link to a specific problem
    problem: {
        type: Schema.Types.ObjectId,
        ref: 'problems',
        required: true,
    },
    // Store the time until the next required submission/attempt
    time_to_next: {
        type: Date,
        default: Date.now,
        required: true,
    },
    // Store the lifetime results for the problem
    // Success is a correct submission
    // Incorrect is an incorrect submission
    results: [{
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
    }
    ],
    // Submissions on this particular problem
    submissions: [
        {
            submission: {
                type: Schema.Types.ObjectId,
                ref: 'submissions',
            }
        }
    ]
})

module.exports = ProblemStatus = mongoose.model('problem_status', ProblemStatusSchema)