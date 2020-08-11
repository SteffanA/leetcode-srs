const Problem = require('../../models/Problem')
const User = require('../../models/User')
const auth = require('../../middleware/auth')

const express = require('express')
const {check, validationResult} = require('express-validator')
const dotenv = require('dotenv')

const router = express.Router()
dotenv.config({path: '../../.env'}) // for environ variables

// @route  GET /api/problems/:id
// @desc   Get a problem by id
// @access Public
router.get('/:id', async (req, res) => {
    try {
        // Try to get the problem by ID
        const problem = await Problem.findOne({id: req.params.id})

        // Check that the problem actually exists
        if (!problem) {
            // Doesn't exist, return bad request
            return res.status(404).json({msg: 'Problem not found.'})
        }

        return res.json({problem})
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error.')
    }
})

// @route  GET /api/problems/
// @desc   Get all problems
// @access Public
router.get('/', async (req, res) => {
    try {
        start = null
        end = null
        if (req.query.start) {
            start = req.query.start
            console.log('Have a query start of ' + start)
        }
        if (req.query.end) {
            end = req.query.end
            console.log('Have a query end of ' + end)
        }
        // NOTE: We're finding based on id, NOT _id! _id is the DB id, whereas id is the leetcode
        // problem ID!
        let problems = null
        // TODO: Figure out if there's a way to pass null into gte/lte w/o causing problems
        // such that this logic can be condensed to a single query again
        if (start && end){
            console.log('start end find')
            problems = await Problem.find().where('id').gte(start).lte(end)
        }
        else if (start) {
            console.log('start find')
            problems = await Problem.find().where('id').gte(start)
        }
        else if (end) {
            console.log('end find')
            problems = await Problem.find().where('id').lte(end)
        }
        else {
            console.log('everything find')
            problems = await Problem.find()
        }
        
        if (!problems) {
            console.log('No problems')
            return res.status(404).json({errors: [{msg: 'No problems found.'}]})
        }

        return res.json(problems)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error.')
    }
})

// @route  GET /api/problems/specific
// @desc   Get all problems between the passed query range
// @access Public
// router.get('/', async (req, res) => {
//     try {
//         const problems = await Problem.find()
//         if (!problems) {
//             return res.status(404).json({errors: [{msg: 'No problems found.'}]})
//         }

//         return res.json(problems)
//     } catch (error) {
//         console.error(error.message)
//         return res.status(500).send('Server error.')
//     }
// })

// @route  POST /api/problems
// @desc   Add a new LeetCode problem to the database
// @access Admin
router.post('/', [auth, [
    check('id', 'Problem must have valid id.').not().isEmpty(),
    check('name', 'Problem must have a name').not().isEmpty(),
    check('problem_text', 'Problem must have accompanying text').not().isEmpty(),
    check('link', 'Must include link to problem').not().isEmpty(),
    check('difficulty', 'Problem must have a difficulty level').isNumeric(),
    check('is_premium', 'Problem must be marked premium or not').isBoolean(),
]], async (req, res) => {
    // Check our request contains required fields
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty) {
        // Something was missing, send an error
        return res.status(400).json({errors : errors.array()})
    }
    try {
        // Get user, ensure is admin user.
        //TODO: Learn the real way to make admin routes
        // If admin, allow. If not, unauthorized msg
        const user = await User.findById(req.user.id)
        const admin_email = process.env.ADMIN_EMAIL
        if (!user || user.email != admin_email) {
            return res.status(401).json({msg: 'Access denied'})
        }

        // Valid admin - create the problem and post it.
        const {
            id,
            name,
            problem_text,
            link,
            test_case,
            start_code,
            difficulty,
            is_premium,
        } = req.body

        // Check if the problem already exists before saving
        const existingProblem = await Problem.findOne({id: id})
        if (existingProblem) {
            return res.status(400).json({errors: [{msg: 'Problem already exists'}]})
        }

        const newProblem = new Problem({
            id: id,
            name: name,
            problem_text: problem_text,
            link: link,
            test_case: test_case,
            start_code: start_code,
            difficulty: difficulty,
            is_premium: is_premium
        })

        // Send to DB
        const problem = await newProblem.save()
        return res.json(problem)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error.')
    }
})


// @route  PUT /api/problems
// @desc   Updates a LeetCode problem in the database
// @access Admin
router.put('/', [auth, [
    check('id', 'Problem must have valid id.').not().isEmpty(),
]], async (req, res) => {
    // Check our request contains required fields
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty) {
        // Something was missing, send an error
        return res.status(400).json({errors : errors.array()})
    }
    try {
        // Get user, ensure is admin user.
        //TODO: Learn the real way to make admin routes
        // If admin, allow. If not, unauthorized msg
        const user = await User.findById(req.user.id)
        const admin_email = process.env.ADMIN_EMAIL
        if (!user || user.email != admin_email) {
            return res.status(401).json({msg: 'Access denied'})
        }

        // Valid admin - parse out the updated fields
        const {
            id,
            name,
            problem_text,
            link,
            test_case,
            start_code,
            difficulty,
        } = req.body

        // Find the problem to be updated
        const existingProblem = await Problem.findOne({id: id})
        if (!existingProblem) {
            // Couldn't find the problem, send Conflict response
            return res.status(409).json({errors: [{msg: 'Problem does not exist.'}]})
        }
        // Update the problem's existing fields with updated ones, if the updated exist
        // Note we do not/cannot allow changes to the id field
        if (name) {existingProblem.name = name}
        if (problem_text) {existingProblem.problem_text = problem_text}
        if (link) {existingProblem.link = link}
        if (test_case) {existingProblem.test_case = test_case}
        if (start_code) {existingProblem.start_code = start_code}
        if (difficulty) {existingProblem.difficulty = difficulty}

        // Send the update to the database
        const updatedProblem = await existingProblem.save()
        return res.json(updatedProblem)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error.')
    }
})

module.exports = router