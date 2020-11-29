const Problem = require('../../models/Problem')
const User = require('../../models/User')
const auth = require('../../middleware/auth')

const express = require('express')
const {check, validationResult} = require('express-validator')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const router = express.Router()
dotenv.config({path: '../../.env'}) // for environ variables

// @route  GET /api/problems/
// @desc   Get all problems
// @access Public
router.get('/', async (req, res) => {
    try {
        start = null
        end = null
        if (req.query.start) {
            start = req.query.start
        }
        if (req.query.end) {
            end = req.query.end
        }
        // NOTE: We're finding based on id, NOT _id! _id is the DB id, whereas id is the leetcode
        // problem ID!
        let problems = null
        // TODO: Figure out if there's a way to pass null into gte/lte w/o causing problems
        // such that this logic can be condensed to a single query again
        if (start && end){
            problems = await Problem.find().where('id').gte(start).lte(end)
        }
        else if (start) {
            problems = await Problem.find().where('id').gte(start)
        }
        else if (end) {
            problems = await Problem.find().where('id').lte(end)
        }
        else {
            problems = await Problem.find()
        }
        
        if (!problems) {
            console.log('No problems')
            return res.status(404).json({errors: [{msg: 'No problems found.'}]})
        }

        return res.json(problems)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

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
        console.error('Get problem by id err: ' + error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

// @route  GET /api/problems/name/:search
// @desc   Get problems that match the search term
// @access Public
router.get('/name/:search', async (req, res) => {
    try {
        // Try to get the problem checking if the problem's name contains the search term
        // Note /regex/flag is a notation we can use for constant regex expressions too
        // /req.params.search/i
        // TODO: Figure out how/if RegExp objects can be used in mongo searchs
        // re = RegExp('\\b(' + req.params.search + ')\\b', 'i')
        const problems = await Problem.find({$or:
            [
                {name: {$regex: req.params.search, $options: 'i'}},
                {problem_text: {$regex: req.params.search, $options: 'i'}},
            ]}
            ).sort({id: 1})
        return res.json({problems})
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})


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
        return res.status(400).json({errors : validationErrors.array()})
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
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})


// @route  PUT /api/problems/bulk
// @desc   Get multiple problems by ids
// @note   This would be a GET usually, but axios on the frontend doesn't allow
//         for GET requests with a body
// @access Public
router.put('/bulk', [
    check('problems', 'Must provide problems to update list with').not().isEmpty(),
    check('problems', 'Must provide array of problem IDs').isArray(),
    check('problems.*', 'All problem IDs must be a valid MongoID').isMongoId(),
], async (req, res) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty) {
        // Something was missing, send an error
        return res.status(400).json({errors : validationErrors.array()})
    }
    try {
        // Convert all the ID strings to Mongoose object IDs
        const object_ids = req.body.problems.map(id => mongoose.Types.ObjectId(id))
        // Try to get the problems by IDs
        const problems = await Problem.find({'_id' : {$in: object_ids}})

        // Check that the problems actually exist
        if (!problems) {
            // Doesn't exist, return bad request
            return res.status(404).json({msg: 'Problems not found.'})
        }
        return res.json({problems})
    } catch (error) {
        console.error('Bulk problem get err: ' + error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
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
        return res.status(400).json({errors : validationErrors.array()})
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
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

module.exports = router