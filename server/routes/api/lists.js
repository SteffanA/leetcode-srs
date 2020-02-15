const List = require('../../models/Lists.js')
const User = require('../../models/User')

const express = require('express')
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const router = express.Router()



// @route  POST api/lists
// @desc   Create a new list
// @access Private
router.post('/', [auth, [
    check('name', 'Lists must be named.').not().isEmpty(),
]], async (req, res) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        // Failed a validation check, return our errors.
        return res.status(400).json({errors: validationErrors.array()})
    }

    // Request was validated, let's create our list
    try {
        //TODO: Eventually, should limit # of lists per user. 100?
        // Since we can make multiple lists with the same name, no need to check unqiueness
        // Likewise for problems contained within
        const {
            name,
            public
        } = req.body

        // TODO: Should we check to ensure public is a bool?
        const newList = new List({
            name,
            public
        })

        const list = await newList.save()
        return res.json(list)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server Error')
    }
})

module.exports = router