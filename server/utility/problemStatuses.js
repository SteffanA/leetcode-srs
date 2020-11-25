const Problem = require('../models/Problem.js')
const User = require('../models/User')

const {addDaysToDate, addDays} = require('./utility')

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
        results.incorrect += 1
    }

    problem_status.interval = (ttn === 0 ? 1 : ttn)
    //Fix up date based on ttn
    let prior_sub = problem_status.next_submission
    if (ttn !== 0) {
        // If ttn isn't 0, set next_submission to
        //  cur Date + (ttn as Days)
        problem_status.next_submission = addDays(ttn)
    }
    else{
        // TTN is 0, set next submission to tomorrow
        problem_status.next_submission = addDays(1)
    }

    // save the User with updated status
    await user.save()

    return user.problem_statuses[index]
}

// Adds a 'color' field to the object of problems based on the
// time of next submission
exports.addColorToProblemsBasedOnTON = (user, problems) => {
    const now = new Date(Date.now())
    const statuses = user.problem_statuses
    // Create a map of problem ID to status based on user's statuses
    const probIdToStatus = new Map()
    for (const [index, status] of statuses.entries()) {
        console.log(status.problem.toString())
        probIdToStatus.set(status.problem.toString(), status)
    }
    // Make a deep copy of the info for the problems so we
    // can add a color property to it
    let prob_copy = []
    problems.map((prob) => {
        prob_copy.push(Object.assign({}, prob.toObject()))
    })
    for (let prob of prob_copy) {
        const status = probIdToStatus.get(prob._id.toString())
        if (status) {
            // Get the time of next submission
            const ton = status.next_submission
            const tonAsDate = new Date(ton)
            let color = 'green'
            if (tonAsDate < addDaysToDate(now, 3)) {
                color = 'red'
            }
            else if (tonAsDate < addDaysToDate(now, 7)) {
                color = 'yellow'
            }
            Object.assign(prob, {'color' : color})
        }
        else {
            // Assume not done.
            Object.assign(prob, {'color' : 'red'})
        }
    }
    return prob_copy
}