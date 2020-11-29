const Problem = require('../../models/Problem.js')
const User = require('../../models/User.js')

const express = require('express')
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')
const {createProblemStatus, updateProblemStatus} = require('../../utility/problemStatuses')

const router = express.Router()



// @route  GET api/problem_status/
// @desc   Get all problem statuses for a user
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        // Check if we have any statuses
        if (user.problem_statuses.length === 0) {
            return res.status(404).json({errors: [{msg: 'No problem statuses found.'}]})
        }
        return res.json(user.problem_statuses)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

// @route  GET api/problem_status/:problem_id
// @desc   Get a problem status for a specific problem
// @access Private
router.get('/:problem_id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const problem = await Problem.findOne({id: req.params.problem_id})
        // Make sure problem exists
        if (!problem) {
            return res.status(404).json({errors: [{msg: 'Problem does not exist.'}]})
        }
        const index = user.problem_statuses.map((status) => {
                return status.problem.toString()})
                .indexOf(problem._id.toString())
        // Check if we have any actually status for the given problem
        if (index === -1) {
            return res.status(404).json({errors: [ {msg: 'No status for this problem.'}]})
        }
        return res.json(user.problem_statuses[index])
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

// @route  PUT api/problem_status/next_times
// @desc   Get the time of next submission for all provided problems
// @access Private
router.put('/next_times', [auth, [
    check('problems', 'Must provide array of problems.').isArray(),
    check('problems.*', 'Must provide problem IDS').isMongoId(),
]], async (req, res) => {
    // Check our request contains required fields
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty) {
        // Something was missing, send an error
        return res.status(400).json({errors : validationErrors.array()})
    }
    try {
        const user = await User.findById(req.user.id)
        const {
            problems
        } = req.body

        let problemToTime = new Map()
        // Define current time in advance so all problems mapped to
        // 'now' have the same value
        const curDate = new Date()
        const curTime = curDate.getTime()
        for (let problemID of problems) {
            const index = user.problem_statuses.map(status=> status.problem.toString() ).indexOf(problemID)
            if (index === -1) {
                // We don't have a status for this problem.
                // Map it to current time
                problemToTime.set(problemID,curTime)
            }
            else {
                // Grab the next_submission date
                const next_sub_time = user.problem_statuses[index].next_submission
                problemToTime.set(problemID, next_sub_time )
            }
        }
        return res.json(Object.fromEntries(problemToTime))
    } catch (e) {
        console.error('Error getting next sub times: ' + e.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

// @route  PUT api/problem_status/:problem_id
// @desc   Create or update a problem status for a problem
// @access Private
router.put('/:problem_id', [auth,[
    check('result', 'Result for this attempt required.').isBoolean(),
    check('time_multiplier', 'Multiplier for successful attempt required').isNumeric()
]], async (req, res) => {
    try {
        console.log('Updating problem status for problem ' + req.params.problem_id)
        // Check our validators
        const validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            // We had some errors, send them back.
            return res.status(400).json({errors: validationErrors.array()})
        }

        // Make sure problem actually exists
        const problem = await Problem.findOne({id: req.params.problem_id})
        if (!problem) {
            // Problem doesn't exist
            return res.status(404).json({errors: [{msg: 'Problem does not exist.'}]})
        }

        // Get our user
        const user = await User.findById(req.user.id)
        // Parse out the body's variables
        const {
            result,
            time_multiplier
        } = req.body

        // Time to next depends on multiplier and result
        // Note that result is true for a successful attempt, false for incorrect
        // Check if we already have a problem status for this particular problem attached to this user
        let index = -1
        // Check that we actually have any statuses to begin with
        if (user.problem_statuses.length !== 0) {
            index = user.problem_statuses.map((status) => {
                return status.problem.toString()})
                .indexOf(problem._id.toString())
        }
        if (index !== -1) {
            // Update the existing problem status
            const status = await updateProblemStatus(user, time_multiplier, result, index)
            return res.json(status)
        }
        // Else problem status for this problem does not exist
        else {
            // Create a new problem status for this problem
            const new_status = await createProblemStatus(result, time_multiplier, user, problem)
            return res.json(new_status)
        }
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})


// @route  PUT api/problem_status/reset/:problem_id
// @desc   Reset a problem status for a problem. Creates if DNE
// @access Private
router.put('/reset/:problem_id', [auth],
async (req, res) => {
    try {
        // Get our problem being referenced
        const problem = await Problem.findOne({id: req.params.problem_id})
        if (!problem) {
            // Problem doesn't exist
            return res.status(404).json({errors: [{msg: 'Problem does not exist.'}]})
        }

        // Get the problem_status for this problem for our user
        const user = await User.findById(req.user.id)
        let index = -1
        if (user.problem_statuses.length !== 0) {
            index = user.problem_statuses.map((status) => {
                return status.problem.toString()})
                .indexOf(problem._id.toString())
        }
        let problem_status = null
        if (index === -1) {
            // Problem status doesn't exist for this problem
            // Make a new empty problem status for it
            problem_status = {
                problem: problem._id,
                results: {
                    success: 0,
                    incorrect: 0
                },
            }
        }
        else {
            // Get the problem status for the problem by the index
            problem_status = user.problem_statuses[index]
        }
        // Clear out the data
        problem_status.next_submission = Date.now()
        problem_status.interval = 1
        problem_status.results.success = 0
        problem_status.results.incorrect = 0

        //DEFERRED: Need to actually delete all submissions from database
        //Should we reset submissions? Might be worth having even
        // const submissions = problem_status.submissions
        // problem_status.submissions = []

        // if we reset our progress. Let's keep for now.
        // for (let submission of submissions) {
        //     await submission.remove()
        // }

        //Save the updated status to the user
        await user.save()

        return res.json(user.problem_statuses[index])
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

module.exports = router