const Submission = require('../../models/Submission')
const User = require('../../models/User')
const Problem = require('../../models/Problem')

const express = require('express')
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')
const {createProblemStatus, updateProblemStatus} = require('../../utility/problemStatuses')

const router = express.Router()

// @route  GET api/submissions/lc/:leetcode_id
// @desc   Retrieve all submissions for a particular problem based on LeetCode id
// @access Private
router.get('/lc/:leetcode_id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const problem = await Problem.findOne({id: req.params.leetcode_id})
        // Check the problem actually exists
        if (!problem) {
            return res.status(404).json({errors: [{msg: 'Problem does not exist.'}]})
        }
        // Try to find the status related to the problem given
        const index = user.problem_statuses.map((status) => {
                return status.problem.toString()})
                .indexOf(problem._id.toString())
        // Check that the status exists for this problem
        if (index === -1) {
            return res.status(404).json({errors: [{msg: 'No data for this problem.'}]})
        }
        const submissions = user.problem_statuses[index].submissions
        const allSubs = await Submission.find().where('_id').in(submissions)

        return res.json(allSubs)
    } catch (error) {
        console.error('Error when getting submission based on LC id ' + error)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

// @route  GET api/submissions/:problem_id
// @desc   Retrieve all submissions for a particular problem based on MonogoDB _id
// @access Private
router.get('/:problem_id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const problem = await Problem.findOne({_id: req.params.problem_id})
        // Check the problem actually exists
        if (!problem) {
            return res.status(404).json({errors: [{msg: 'Problem does not exist.'}]})
        }
        // Try to find the status related to the problem given
        const index = user.problem_statuses.map((status) => {
                return status.problem.toString()})
                .indexOf(problem._id.toString())
        // Check that the status exists for this problem
        if (index === -1) {
            return res.status(404).json({errors: [{msg: 'No data for this problem.'}]})
        }
        const submissions = user.problem_statuses[index].submissions
        const allSubs = await Submission.find().where('_id').in(submissions)

        return res.json(allSubs)
    } catch (error) {
        console.error('Error when getting submissions based on mongodb id ' + error)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

// @route  POST api/submissions/:problem_id
// @desc   Create a new submission for a problem
// @access Private
router.post('/:problem_id', [auth, [
    check('result', 'Submission result is required').isBoolean(),
    check('time_spent', 'Time spent on submission is required').isNumeric(),
]], async (req, res) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        // Some check failed, send bad response
        return res.status(400).json({errors: validationErrors.array()})
    }
    try {
        const user = await User.findById(req.user.id)
        const problem = await Problem.findOne({id: req.params.problem_id})
        // Check the problem actually exists
        if (!problem) {
            return res.status(404).json({errors: [{msg: 'Problem does not exist.'}]})
        }

        const {
            text,
            result,
            mem_used,
            execution_time,
            time_spent
        } = req.body

        // Get the status for this problem
        let status = null
        const index = user.problem_statuses.map((status) => {
                return status.problem.toString()})
                .indexOf(problem._id.toString())
        if (index === -1) {
            // Couldn't find status - create one, we assume this is a first submission
            // TODO: Adjust this to use the user's defined multiplier
            status = await createProblemStatus(result, 1.5, user, problem)
        }
        else {
            // Update the status based on the submission results
            // TODO: Get the time multiplier from the user's settings and replace
            status = await updateProblemStatus(user, 1.5, result, index)
        }
        // Otherwise this status does belong to the user.
        // Create a new Submission and add it to the status
        const sub = new Submission({
            result: result,
            time_spent: time_spent,
        })
        // Add optional paramaters if they exist
        if (text) {sub.text = text}
        if (mem_used) {sub.mem_used = mem_used}
        if (execution_time) {sub.execution_time = execution_time}

        // Save the submission
        const newSub = await sub.save()

        // Append the submission to the User's problem_status's submissions array
        status.submissions.push(newSub)
        // Save the user w/ updated submission array
        await user.save()

        return res.json(newSub)
    } catch (error) {
        console.error('error when posting new submission for problem ' + error)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

// TODO: Determine if a put request to update existing submissions makes any sense
// Maybe if we want to update submission text after the fact. Idk

module.exports = router