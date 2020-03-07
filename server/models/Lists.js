/*
List of problems for a user to work their way through.
Users may have multiple lists.
*/

const mongoose = require('mongoose')

const ListSchema = mongoose.Schema({
    // User isn't a mapping - eventually, I want lists to be sharable
    // This is also why results are split out into their own model
    // I can forsee lots of duplicate lists existing. Best way to deal w/ that?
        // Shouldn't be a huge issue. A list will be like, 30+1+<ID>+<250*ID> bytes max
    //Name of the list
    name: {
        type: String,
        required: true,
        max: 30,
    },
    // Is this list public or private to the user?
    // Publicity; current thought process below.
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