const auth = require('../../middleware/auth')
const User = require('../../models/User')

const express = require('express')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv') // For getting environ vars from .env file

dotenv.config() // Config environ vars
const router = express.Router()

// @route  POST api/auth
// @desc   Authenticate user & retrieve token
// @access Public
router.post('/', [
    check('email', 'Registered email address is required').isEmail(),
    check('password', 'Password is required').exists()
], async(req, res) => {
    // Validate that our checks were successful
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        // Had some errors, send back bad request w/ the errors
        return res.status(400).json({errors: validationErrors.array()})
    }

    // No validation errors, proceed

    // Pull out request parameters
    const {email, password} = req.body
    try {
        // First, check that the user actually exists
        let user = await User.findOne({email: email})
        if (!user) {
            // Couldn't find the user, send a bad request back.
            return res.status(400).json({errors: [{msg: 'Invalid credentials.'}]})
        }

        // User exists. Now validate password matches what's on file
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            // Invalid password, send bad request back.
            return res.status(400).json({errors: [{msg: 'Invalid credentials.'}]})
        }

        // Password matches, return token to allow user to login
        const timeout = process.env.DEVELOPMENT ? 360000 : 3600 // extend token life during dev
        // Return token to allow user to login.
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload, // pass user ID payload
            process.env.JWT_SECRET, // pass our secret
            {expiresIn: timeout}, // pass timeout
            (err, token) => { // send token to client on callback
                if (err) {throw err}
                // No error, return the token
                return res.json({ token })
            }
        )
        console.log('User authenticated.')
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server Error.')
    }
})

module.exports = router