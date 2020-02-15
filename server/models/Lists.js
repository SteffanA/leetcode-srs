/*
List of problems for a user to work their way through.
Users may have multiple lists.
*/

const mongoose = require('mongoose')

const ListSchema = mongoose.Schema({
    // User isn't a mapping - eventually, I want lists to be sharable
    // This is also why results are split out into their own model
    // TODO: I can forsee lots of duplicate lists existing. Best way to deal w/ that?
    //Name of the list
    name: {
        type: String,
        required: true,
    },
    // Is this list public or private to the user?
    // TODO: Publicity; current thought process below.
    /*
        If a list isn't public, only one user can see it. So since we have unique, random ids
        We can assume that only the original creator will see it while private.
        Once it goes public though, anyone can see it and access it.
        Due to this, making public should be described as permanent.
    */
    public: {
        type: Boolean,
        required: true,
        default: false,
    },
    // Problems associated with this list.
    problems: [
        {
            problem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'problems',
                required: true,
            },
        }
    ],
    // Who made this list? Only they may edit it.
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    }
})

module.exports = List = mongoose.model('list', ListSchema)