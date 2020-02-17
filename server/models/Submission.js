/*
Model for submissions

Submissions are the result and the code associated with a LeetCode submission.
*/
const mongoose = require('mongoose')

//TODO: Would it make sense to attach the User to Submission?
const SubmissionSchema = mongoose.Schema({
    // Text is not required
    // First impl won't auto-save, so not neccessary
    // Eventually may make required, or simply auto-save so it ends up existing by default
    text: {
        type: String,
    },
    // Result for the submission - true means pass, false means fail
    result: {
        type: Boolean,
        required: true,
    },
    // Time/date of this submission
    submit_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    // Optional: store the memory used for this submission (data from LC)
    mem_used: {
        type: Number,
    },
    // Optional: store the amount of time used for this submission (data from LC)
    execution_time: {
        type: Number,
    },
    // How long did it take from starting the problem to submitting this?
    time_spent: {
        type: Number,
        required: true,
    }
})

module.exports = Submission = mongoose.model('submission', SubmissionSchema)