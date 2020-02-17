const User = require('../../models/User')
const List = require('../../models/Lists')

const express = require('express')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const auth = require('../../middleware/auth')
const mongoose = require('mongoose')

const router = express.Router()
dotenv.config() // So we can read environ vars

// @route  POST api/users
// @desc   Register user
// @access Public
router.post('/', [
    // Validation checks to ensure we get data expected.
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Please include a valid email.').not().isEmpty(),
    check('password', 'Please enter a password with at least 6 characters.').isLength({min: 6})
], async (req, res) => {
    // Check that our... checks are valid
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        // Send bad request if we have any errors.
        return res.status(400).json({ errors: errors.array() })
    }

    // Parse out the required information from the request body
    const {name, email, password} = req.body

    try {
        // Check if the user already exists
        let user = await User.findOne({email: email})
        if (user) {
            // Found this user - send bad request
            return res.status(400).json({errors: [ {msg: 'User already exists for this email'}]})
        }

        // Create our user
        user = new User({
            name: name,
            email: email,
            password: password,
            // Creation date will be made by default to NOW
        })

        // Encypt the password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
        //TODO: Understand why the below wouldn't work when pw not attached to user
        // const hashPass = await bcrypt.hash(password, salt)
        // user.password = await hashPass

        // Now we can save our user
        await user.save()

        // Return the jsonwebtoken so the user is logged in immediately after registering
        const payload = {
            user: {
                id: user.id //user's id auto-generated by mongoDB
            }
        }

        // Set our timeout for the token
        // Default to an hour, unless in development mode
        const timeout = process.env.DEVELOPMENT ? 360000 : 3600
        // Sign our token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: timeout},
            (err, token) => {
                // Send token to client on callback
                if (err) {throw err}
                // No error, return token
                return res.json({token})
            },
        )
        console.log('User registered')
    } catch (error) {
        console.error('Error registering: ', error.message)
        return res.status(500).send('Server error')
    }
})

// @route  PUT api/users/add/:id
// @desc   Add a List to User's Lists array
// @access Private
router.put('/add/:id', auth,
async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).send({errors: [{msg: 'List not found.'}]})
        }
        const list = await List.findById(req.params.id)
        if (!(!list || list.public || list.creator.toString() === user._id.toString()))
        {
            // Either list doesn't exist, isn't public, or isn't public & not owned by user
            // Return not found
            return res.status(404).json({errors: [{msg: 'List not found.'}]})
        }
        // Check that list doesn't exist in the User's lists already
        const index = user.lists.map(curList => curList._id.toString()).indexOf(list._id.toString())
        if (index !== -1) {
            // Found this list already, don't let us add it twice.
            return res.status(409).json({errors: [{msg: 'List already in User\'s lists.'}]})
        }
        user.lists.push(list)

        // Save updated user w/ lists
        await user.save()

        // Return the updated lists array
        return res.json(user.lists)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error')
    }
})

// @route  PUT api/users/remove/:id
// @desc   Remove a List from User's Lists array
// @access Private
router.put('/remove/:id', auth,
async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).send({errors: [{msg: 'List not found.'}]})
        }
        const list = await List.findById(req.params.id)
        if (!list)
        {
            // Return not found, list doesn't exist
            return res.status(404).json({errors: [{msg: 'List not found.'}]})
        }
        // Check to see if list is a part of user's current lists
        const index = user.lists.map(curList => curList._id.toString()).indexOf(list._id.toString())
        if (index === -1) {
            // This list isn't part of the user's lists
            return res.status(404).json({errors: [{msg: 'List not a part of user\'s Lists.'}]})
        }

        // Remove the list from the lists array
        user.lists.splice(index, 1)

        // Save updated
        await user.save()
        // Return updated lists
        return res.json(user.lists)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error')
    }
})


// @route  DELETE api/users
// @desc   Delete user
// @access Private

module.exports = router