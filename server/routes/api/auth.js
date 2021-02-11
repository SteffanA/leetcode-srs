const User = require('../../models/User')

const express = require('express')
const {check, validationResult, oneOf} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv') // For getting environ vars from .env file

dotenv.config({path: '../.env'}) // Config environ vars
const router = express.Router()


// @route  POST api/auth
// @desc   Authenticate user & retrieve token
// @access Public
router.post('/', [oneOf([
    // Validation checks to ensure we get data expected.
    check('name', 'Name or Email must be provided').not().isEmpty(),
    check('email', 'Name or Email must be provided').not().isEmpty()
]),
    check('password', 'Password is required').exists()
], async(req, res) => {
    // Validate that our checks were successful
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        // Had some errors, send back bad request w/ the errors
        // Since we have a oneOf check, sanitize the error output for the frontend
        let errorArray = []
        if (validationErrors.array()[0].nestedErrors) {
            errorArray = validationErrors.array()[0].nestedErrors.map(item => ({'msg': item.msg}))
        }
        else {
            errorArray = validationErrors.array()
        }
        return res.status(400).json({ errors: errorArray })
    }

    // No validation errors, proceed

    // Pull out request parameters
    const {name, password, email} = req.body
    try {
        // First, check that the user actually exists
        let user = null
        // Allow login with either email or name
        if (name) {
            user = await User.findOne({name: name})
            if (!user) {
                // Couldn't find the user, send a bad request back.
                return res.status(400).json({errors: [{msg: 'Invalid credentials.'}]})
            }
        }
        else if (email) {
            user = await User.findOne({email: email})
            if (!user) {
                // Couldn't find the user, send a bad request back.
                return res.status(400).json({errors: [{msg: 'Invalid credentials.'}]})
            }
        }
        // User exists. Now validate password matches what's on file
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            // Invalid password, send bad request back.
            return res.status(400).json({errors: [{msg: 'Invalid credentials.'}]})
        }

        // Password matches, return token to allow user to login
        // extend token life during dev
        const timeout = process.env.DEVELOPMENT ? 3600000 : 360000 
        // Return token to allow user to login.
        const payload = {
            user: {
                id: user.id
            }
        }
        const username = user.name
        jwt.sign(
            payload, // pass user ID payload
            process.env.JWT_SECRET, // pass our secret
            {expiresIn: timeout}, // pass timeout
            (err, token) => { // send token to client on callback
                if (err) {throw err}
                // No error, return the token, token lifespan, and username
                return res.json({ token, timeout, username })
            }
        )
    } catch (error) {
        console.error('Error when authing user ' + error.message)
        return res.status(500).json({errors: [ {msg: 'Server error.'}]})
    }
})

module.exports = router