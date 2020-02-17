const Submission = require('../../models/Submission')
const User = require('../../models/User')
const Problem = require('../../models/Problem')

const express = require('express')
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')

const router = express.Router()

// @route  GET api/submission/:problem_id
// @desc   Retrieve all submissions for a particular problem
// @access Private
router.get('/:problem_id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const problem = await Problem.findOne({id: req.params.problem_id})
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
        console.error(error)
        return res.status(500).send('Server error')
    }
})

// @route  POST api/submission/:problem_id
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
        // Get the status for this problem
        const index = user.problem_statuses.map((status) => {
                return status.problem.toString()})
                .indexOf(problem._id.toString())
        if (index === -1) {
            // Couldn't find status, send not found
            return res.status(404).json({errors: [{msg: 'Problem status not found.'}]})
        }
        const status = user.problem_statuses[index]
        // Otherwise this status does belong to the user.
        const {
            text,
            result,
            mem_used,
            execution_time,
            time_spent
        } = req.body
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
        console.error(error)
        return res.status(500).send('Server error')
    }
})

// TODO: Determine if a put request to update existing submissions makes any sense
// Maybe if we want to update submission text after the fact. Idk

module.exports = router