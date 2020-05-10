// Basic authentication middleware
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv') // For access to environmental vars
dotenv.config({path: '../.env'}) // Config environ vars

const Auth = (req, res, next) => {
    // Get the token from the header
    const token = req.header('x-auth-token')

    // Check if no token exists
    if (!token){
        console.log('No token in auth')
        return res.status(401).json({msg: 'No token provided. Authorization denied.'})
    }

    // Token exist, verify it.
    try {
        // Decode our token
        // Ensure JWT_SECRET is setup in enviroment
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Set our user to the decoded token
        req.user = decoded.user
        next() // Move onto the next middleware function
    } catch (error) {
        console.log('Bad token')
        return res.status(401).json({msg: 'Invalid token. Authorization denied.'})
    }
}

module.exports = Auth