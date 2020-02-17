/*
Model for leetcode problems

These are problems directly grabbed from LeetCode.
*/
const mongoose = require('mongoose')

const ProblemSchema = mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    // Name of the problem
    name: {
        type: String,
        required: true,
    },
    // Text for the problem statement
    problem_text: {
        type: String,
        required: true,
    },
    // the stub at the end of the link to problem
    link: {
        type: String,
        required: true,
    },
    // Difficulty of the problem
    /*
    1: Easy
    2: Medium
    3: Hard
    */
    difficulty: {
        type: Number,
        required: true,
    },
    // If a premium account is required for the problem
    is_premium: {
        type: Boolean,
        required: true,
    },
    //TODO:
    // The below fields aren't required, and I might change them.
    // The current setup will only really work for a single language
    // I do eventually want support for more than just Python
    // Not sure if I should bother to store this, or just grab from LC on command
    // Seems like it would be better to store locally for response, + no rate limiting
    // Issue is if the test case or start code changes, wouldn't know w/o problem report.
    // Same issue applies to problem_text.
    // Could be resolved by doing a scan and DB update once a month or something.

    // Test case is the example test case given by LC
    test_case: {
        type: String,
    },
    // Start code is the initial start code given by LC
    start_code: {
        type: String,
    }
})

module.exports = Problem = mongoose.model('problem', ProblemSchema)