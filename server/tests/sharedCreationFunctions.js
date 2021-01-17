/*
Contains a variety of functions that can be used to build or create
certain objects as a part of a test
*/

const chai = require('chai')
const {expect} = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp);

const dotenv = require('dotenv')
dotenv.config({path: '../../../.env'}) // Config environmental vars to get admin user

const {checkForAddedIDsAsPartOfResObjects,
    } = require('./sharedTestFunctions.js')

// Create a test user in our database with given credentials
const createTestUser = (app, name, email, pass) => {
    return new Promise((resolve) => {
        chai.request(app)
        .post('/api/users')
        .send({
            name : name,
            email: email,
            password: pass,
        })
        .end((err, res) => {
            if (err) reject(err)
            // Check response for a valid 200
            expect(res).to.have.status(200)
            const body = res.body
            expect(body).to.have.property('token')
            resolve(res)
        })
    })
}

// Attempts to either create or login the admin user
// to access the admin token
const createOrGetTokenForAdminUser = (app) => {
    // Gather the admin credentials
    const adminUser = process.env.ADMIN_NAME
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASS
    return new Promise((resolve) => {
        chai.request(app)
        .post('/api/auth')
        .send({
            name : adminUser,
            email: adminEmail,
            password: adminPass,
        })
        .end((err, res) => {
            if (err) reject(err)
            // Check response for a valid 200
            if (res.status === 200) {
                // Successfully logged in
                const body = res.body
                expect(body).to.have.property('token')
                resolve(res)
            }
            else {
                // Define a create function so we can do async stuff
                const create = async () => {
                    r = await createTestUser(app, adminUser, adminEmail, adminPass)
                    return r
                }
                // Couldn't login, try to register
                res = create()
                resolve(res)
            }
        })
    })
}

// Convert the raw JSON from LeetCode's API to an array of the objects we expect
// in our Problem POST routines
const convertLeetCodeResToOurObjects = (lcResAsJson) => {
    let problemJSON = []
    const stats = lcResAsJson.stat_status_pairs
    stats.forEach((stat) => {
        problem = {}
        problem.id = stat.stat.question_id
        problem.name = stat.stat.question__title
        problem.problem_text = 'No text yet'
        problem.link = stat.stat.question__title_slug
        problem.difficulty = stat.difficulty.level
        problem.is_premium = stat.paid_only
        problemJSON.push(problem)
    })
    return problemJSON
}

// Adds a problem status for a particular user and problem
// Will always be successful with a multiplier of 1.5
const addSuccessfulProblemStatus = (app, token, probId) => {
    return new Promise((resolve, reject) => {
        chai.request(app)
        .put('/api/problem_status/' + probId)
        .set({'x-auth-token' : token})
        .send({result : true, time_multiplier : 1.5})
        .end((err, res) => {
            if (err) reject(err)
            expect(res).to.have.status(200)
            const body = res.body
            expect(body).to.have.property('results')
            expect(body).to.have.property('interval')
            expect(body).to.have.property('submissions')
            expect(body).to.have.property('next_submission')
            expect(body).to.have.property('problem')
            expect(body).to.have.property('_id')
            resolve(body)
        })
    })
}

// Creates a new list for the user w/ token provided
const createList = (app, token, list) => {
    return new Promise((resolve, reject) => {
        chai.request(app)
        .post('/api/lists')
        .set({'x-auth-token' : token})
        .send(list)
        .end((err, res) => {
            if (err) reject(err)
            expect(res).to.have.status(200)
            const body = res.body
            expect(body).to.have.property('name')
            expect(body.name).to.be.equal(list.name)
            expect(body).to.have.property('public')
            expect(body.public).to.be.equal(list.public)
            expect(body).to.have.property('problems')
            expect(body).to.have.property('_id')
            resolve(body)
        })

    })
}

// Adds all the given problems to the list provided
// Requires list owned by token user provided
// Expects an array of MongoDB ids for the problems arg
const addProblemsToList = (app, token, listId, problems) => {
    const probs = []
    for (let i = 0; i < problems.length; i++) {
        probs.push({'id' : problems[i], 'add' : true})
    }
    return new Promise((resolve, reject) => {
        chai.request(app)
        .put('/api/lists/bulk/' + listId)
        .set({'x-auth-token': token})
        .send({problems: probs})
        .end((err, res) => {
            if (err) reject(err)
            // Alter the body a bit to fit our verify function, once
            // we have verified that the body comes in the form we expect
            expect(res).to.have.status(200)
            let body = res.body
            expect(body).to.have.property('list')
            expect(body.list).to.have.property('problems')
            body.problems = body.list.problems
            checkForAddedIDsAsPartOfResObjects(res, resolve, problems, 'problems')
            resolve(body)
        })
    })
}

module.exports = {createTestUser, convertLeetCodeResToOurObjects, createOrGetTokenForAdminUser,
    addSuccessfulProblemStatus, createList, addProblemsToList, }