const Problem = require('../models/Problem.js')
const User = require('../models/User')

const {addDays} = require('./utility')

// Contains re-usable functions pertaining to problem statuses

// Create a new problem status for a given problem under a user's profile
// Must provide the result for the problem and the user's determined
// time multiplier
exports.createProblemStatus = async (result, time_multiplier, user, problem) => {
    // Create a new problem status for this problem
    // Note that result is a bool - true for a success, false for incorrect
    const new_status = {
        problem: problem._id,
        interval: (result ? time_multiplier : 1),
        results: {
            success: 0,
            incorrect: 0
        },
    }
    const results = new_status.results
    if (result) {
        // Increment by current date by interval # of days for next_submission
        new_status.next_submission = addDays(new_status.interval)
        results.success += 1
    }
    else {
        results.incorrect += 1
        // Keep next_submission at default Date.now
    }

    // Save problem status to user
    user.problem_statuses.push(new_status)
    await user.save()
    return user.problem_statuses[user.problem_statuses.length-1]
}