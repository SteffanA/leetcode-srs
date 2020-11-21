const Problem = require('../models/Problem.js')
const User = require('../models/User')

const {addDaysToDate} = require('./utility')

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

// Updates the problem status for an existing problem
// Pass the user, time multiplier, problem result, and index of the status
// within the user's problem_statuses array.  These should be validated
// prior to calling this function.  Assume this is called in a trycatch
exports.updateProblemStatus = async (user, time_multiplier, result, index) => {
    console.log('Found existing status')
    // Get the problem status
    const problem_status = user.problem_statuses[index]
    const results = problem_status.results
    // Update this problem status
    let ttn = 0 // ttn = time to next
    if (result) {
        ttn = time_multiplier * problem_status.interval
        results.success += 1
    }
    else {
        // TODO: Does this make sense, keeping the same interval?
        // Should we maybe drop next sub back to 0?
        results.incorrect += 1
    }

    problem_status.interval = (ttn === 0 ? 1 : ttn)
    //Fix up date based on ttn
    let prior_sub = problem_status.next_submission
    if (ttn !== 0) {
        // If ttn isn't 0, set next_submission to
        //  cur Date + (ttn as Days)
        console.log('Adding: ' + ttn + ' to next sub')
        problem_status.next_submission = addDaysToDate(prior_sub, ttn)
    }
    else{
        // TTN is 0, set next submission to tomorrow
        console.log('Adding 1 to next sub')
        problem_status.next_submission = addDaysToDate(prior_sub, 1)
    }

    // save the User with updated status
    await user.save()
    console.log(user.problem_statuses[index])

    return user.problem_statuses[index]
}