
const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const dotenv = require('dotenv') // For getting environ vars from .env file
dotenv.config({path: '../../../.env'}) // Config environmental vars to get admin user
const fs = require('fs') // For reading local JSON file

const {checkForCorrectErrors, checkForValidAddition,
        checkForValidRemoval, checkSuccessfulLogin,
        checkValidationResult, checkForCorrectMessage,
        checkForAddedObject, checkForAddedIDs} = require('../sharedTestFunctions.js')

const BASE_URL = '/api/problems'
const testProblemsPath = './../utility/testProblems.json'

describe('Problems API Tests' , () => {

    const testUser = 'problemTester'
    const testEmail = 'problemTester@test.com'
    const testPass = 'test12'
    let token = ''
    // Create a user account we can test our problems routes with
    before(() => {
        return new Promise((resolve) => {
            chai.request(app)
            .post('/api/users')
            .send({
                name : testUser,
                email: testEmail,
                password: testPass,
            })
            .end((err, res) => {
                if (err) reject(err)
                // Check response for a valid 200
                expect(res).to.have.status(200)
                const body = res.body
                expect(body).to.have.property('token')
                token = body.token
                resolve(res)
            })
        })
    })

    const adminUser = process.env.ADMIN_NAME
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASS
    let adminToken = ''
    // Create an admin account we can test adding problems with
    before(() => {
        return new Promise((resolve) => {
            chai.request(app)
            .post('/api/users')
            .send({
                name : adminUser,
                email: adminEmail,
                password: adminPass,
            })
            .end((err, res) => {
                if (err) reject(err)
                // Check response for a valid 200
                expect(res).to.have.status(200)
                const body = res.body
                expect(body).to.have.property('token')
                adminToken = body.token
                resolve(res)
            })
        })
    })

    // Array that stores our problems we utilize in our tests
    const problemJSON = []
    // Read our test JSON file and convert to the format our API expects & store as array
    before(() => {
        const rawData = fs.readFileSync(testProblemsPath)
        const asJson = JSON.parse(rawData)
        const stats = asJson.stat_status_pairs
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
    })

    describe('Test Can Add New Problems', () => {
        // Use this as a baseline invalid test problem for our validation checks.
        const invalidTestProblemBase = {
            id: 12345,
            name: 'InvalidProblem',
            problem_text : 'This is an invalid Problem.',
            link: 'invalid-link',
            difficulty: 1,
            is_premium: true,
        }

        // Use this as a baseline for testing bulk invalid problem importing
        const invalidProblemsBase = [
            JSON.parse(JSON.stringify(invalidTestProblemBase)),
            JSON.parse(JSON.stringify(invalidTestProblemBase)),
            JSON.parse(JSON.stringify(invalidTestProblemBase)),
        ]

        describe('Test Problem Addition Validation Checks', () => {
            it('Tests Problem Requires ID', (done) => {
                let missingIDObject = JSON.parse(JSON.stringify(invalidTestProblemBase))
                missingIDObject.id = ''
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send({
                    missingIDObject
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem must have valid id.')
                })
            })
            it('Tests Problem Requires Name', (done) => {
                let missingNameObject = JSON.parse(JSON.stringify(invalidTestProblemBase))
                missingNameObject.name = ''
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send({
                    missingNameObject
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem must have a name')
                })
            })
            it('Tests Problem Requires Problem Text', (done) => {
                let missingProbTextObject = JSON.parse(JSON.stringify(invalidTestProblemBase))
                missingProbTextObject.problem_text = ''
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send({
                    missingProbTextObject
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem must have accompanying text')
                })
            })
            it('Tests Problem Requires Link', (done) => {
                let missingLinkObject = JSON.parse(JSON.stringify(invalidTestProblemBase))
                missingLinkObject.link = ''
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send({
                    missingLinkObject
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem must include link to problem')
                })
            })
            it('Tests Problem Requires Difficulty', (done) => {
                let missingDifficultyObject = JSON.parse(JSON.stringify(invalidTestProblemBase))
                missingDifficultyObject.difficulty = ''
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send({
                    missingDifficultyObject
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem must have a difficulty level')
                })
            })
            it('Tests Problem Requires Is Premium', (done) => {
                let missingPremiumObject = JSON.parse(JSON.stringify(invalidTestProblemBase))
                missingPremiumObject.is_premium = ''
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send({
                    missingPremiumObject
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem must be marked premium or not')
                })
            })
        })

        describe('Test Bulk Problem Addition Validation Checks', () => {
            it('Tests Bulk Problem Addition Requires Array of Problems', (done) => {
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : {},
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Must submit array of problems.')
                })
            })

            it('Tests Bulk Problem Addition Requires All Problems To Have ID', (done) => {
                const invalidIDProblems = JSON.parse(JSON.stringify(invalidProblemsBase))
                invalidIDProblems[0].id = ''
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : invalidIDProblems
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem(s) must have valid id.')
                })
            })

            it('Tests Bulk Problem Addition Requires All Problems To Have Name', (done) => {
                const invalidNameProblems = JSON.parse(JSON.stringify(invalidProblemsBase))
                invalidNameProblems[0].name = ''
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : invalidNameProblems
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem(s) must have a name')
                })
            })

            it('Tests Bulk Problem Addition Requires All Problems To Have Problem Text', (done) => {
                const invalidProbTextProblems = JSON.parse(JSON.stringify(invalidProblemsBase))
                invalidProbTextProblems[0].problem_text= ''
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : invalidProbTextProblems
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem(s) must have accompanying text')
                })
            })

            it('Tests Bulk Problem Addition Requires All Problems To Have Link', (done) => {
                const invalidLinkProblems = JSON.parse(JSON.stringify(invalidProblemsBase))
                invalidLinkProblems[0].link = ''
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : invalidLinkProblems
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problems(s) must include link to problem')
                })
            })

            it('Tests Bulk Problem Addition Requires All Problems To Have Difficulty', (done) => {
                const invalidDifficultyProblems = JSON.parse(JSON.stringify(invalidProblemsBase))
                invalidDifficultyProblems[0].difficulty = ''
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : invalidDifficultyProblems
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem(s) must have a difficulty level')
                })
            })

            it('Tests Bulk Problem Addition Requires All Problems To Have Is Premium', (done) => {
                const invalidIsPremiumProblems = JSON.parse(JSON.stringify(invalidProblemsBase))
                invalidIsPremiumProblems[0].is_premium = ''
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : invalidIsPremiumProblems
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem(s) must be marked premium or not')
                })
            })

            it('Tests Bulk Problem Addition Checks Past First Problem', (done) => {
                const invalidDifficultyProblems = JSON.parse(JSON.stringify(invalidProblemsBase))
                invalidDifficultyProblems[2].difficulty = ''
                chai.request(app)
                .post(BASE_URL + '/bulk')
                .set({'x-auth-token': adminToken})
                .send({
                    problems : invalidDifficultyProblems
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem(s) must have a difficulty level')
                })
            })
        })

        it('Tests Can Add Individual Problem', (done) => {
            const prob = problemJSON[0]
            chai.request(app)
            .post(BASE_URL)
            .set({'x-auth-token': adminToken})
            .send(
                prob
            )
            .end((err, res) => {
                if (err) done(err)
                checkForAddedObject(res, done, prob)
            })
        })

        it('Tests Can Add Bulk Problems', (done) => {
            const probs = problemJSON.slice(1,4)
            chai.request(app)
            .post(BASE_URL + '/bulk')
            .set({'x-auth-token': adminToken})
            .send({
                problems: probs
            })
            .end((err, res) => {
                if (err) done(err)
                // Create array of problem IDs to check for - note we're using LC id, not
                // the Mongo _id
                const addedProbIds = []
                for (let prob of probs) {
                    addedProbIds.push(prob.id)
                }
                checkForAddedIDs(res, done, addedProbIds, 'Added')
            })
        })

        it('Tests Cannot Add Problem That Exists Already', (done) => {
            const prob = problemJSON[0]
            chai.request(app)
            .post(BASE_URL)
            .set({'x-auth-token': adminToken})
            .send(
                prob
            )
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 400, 'Problem already exists')
            })
        })

        // This test relies on us adding the same problems in the 'Tests Can Add Bulk Problems'
        // test above - we simply check for the resulting array to be in the 'NotAdded' array
        // instead
        it('Tests Bulk Addition Does Not Add Problems That Exist Already', (done) => {
            const probs = problemJSON.slice(1,4)
            chai.request(app)
            .post(BASE_URL + '/bulk')
            .set({'x-auth-token': adminToken})
            .send({
                problems: probs
            })
            .end((err, res) => {
                if (err) done(err)
                // Create array of problem IDs to check for - note we're using LC id, not
                // the Mongo _id
                const notAddedIds= []
                for (let prob of probs) {
                    notAddedIds.push(prob.id)
                }
                checkForAddedIDs(res, done, notAddedIds, 'NotAdded')
            })
        })

        it('Tests Non-Admin Cannot Add Problems', (done) => {
            const prob = problemJSON[0]
            chai.request(app)
            .post(BASE_URL)
            .set({'x-auth-token': token})
            .send(
                prob
            )
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 401, 'Access denied')
            })
        })

        it('Tests Non-Admin Cannot Add Bulk Problems', (done) => {
            const probs = problemJSON.slice(4,6)
            chai.request(app)
            .post(BASE_URL + '/bulk')
            .set({'x-auth-token': token})
            .send({
                problems: probs
            })
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 401, 'Access denied')
            })
        })
    })

    describe('Test Can Edit Existing Problems', () => {
        describe('Test Problem Update Validation Checks', () => {

        })

        describe('Test Can Update Individual Problems', () => {
            it('Tests Can Update Existing Problem Name', (done) => {

            done()
            })
        })
    })

    describe('Tests Can Get Problem(s)', () => {
        describe('Tests Can Get Individual Problem Information', () => {

        })

        describe('Tests Can Get Problems In ID Range', () => {

        })

        describe('Tests Can Search For Problem', () => {

        })
    })
})
