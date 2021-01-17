const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const dotenv = require('dotenv') // For getting environ vars from .env file
dotenv.config({path: '../../../.env'}) // Config environmental vars to get admin user
const fs = require('fs') // For reading local JSON file

const {checkForCorrectErrors, checkValidationResult,
        checkForReturnedObject, checkForAddedIDs,
        checkAllValidationResults, checkForReturnedObjects,
        } = require('../sharedTestFunctions.js')


const {createTestUser, convertLeetCodeResToOurObjects,
        createOrGetTokenForAdminUser, 
    } = require('../sharedCreationFunctions.js')

const {getFakeMongoDBid} = require('../sharedGetters.js')

const BASE_URL = '/api/problems'
// Note that the test is run at the root of the server module,
// and thus the path is defined as if we are at the root of the server folder
const testProblemsPath = './tests/Problems/testProblems.json'

describe('Problems API Tests' , () => {

    let token = ''
    let adminToken = ''

    // Create a user account we can test our problems routes with
    before(async () => {
        const testUser = 'problemTester'
        const testEmail = 'problemTester@test.com'
        const testPass = 'test12'
        try {
            const res = await createTestUser(app, testUser, testEmail, testPass)
            const body = res.body
            token = body.token
        } catch (error) {
            console.log('Hit error creating test user for Problems.')
            console.log(error)
            expect(false).to.equal(true)
        }
    })

    // Create an admin account we can test adding problems with
    before(async () => {
        try {
            const res = await createOrGetTokenForAdminUser(app)
            const body = res.body
            adminToken = body.token
        } catch (error) {
            console.log('Hit error creating test admin user for Problems.')
            console.log(error)
            expect(false).to.equal(true)
        }
    })

    // Array that stores our problems we utilize in our tests
    const problemJSON = []
    // Read our test JSON file and convert to the format our API expects & store as array
    before(() => {
        const rawData = fs.readFileSync(testProblemsPath)
        const asJson = JSON.parse(rawData)
        problemJSON.push(...convertLeetCodeResToOurObjects(asJson))
    })

    // Use this as a baseline invalid test problem for our validation checks.
    const invalidTestProblemBase = {
        id: 12345,
        name: 'InvalidProblem',
        problem_text : 'This is an invalid Problem.',
        link: 'invalid-link',
        difficulty: 1,
        is_premium: true,
    }

    // These tests add from problem index 0 to index 4 of problemJSON to the DB
    describe('Test Can Add New Problems', () => {
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
                checkForReturnedObject(res, done, prob)
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
            it('Tests Problem Update Requires ID', (done) => {
                let missingIDObject = JSON.parse(JSON.stringify(invalidTestProblemBase))
                missingIDObject.id = ''
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    missingIDObject
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Problem must have valid id.')
                })
            })
        })

        // These tests rely on the prior tests adding problemJSON[0] to the database
        // They will also alter the database version of the problem vs our local problemJSON
        // version.
        describe('Test Can Update Individual Problems', () => {
            it('Tests Can Update Existing Problem Name', (done) => {
                const toBeUpdatedProb = JSON.parse(JSON.stringify(problemJSON[0]))
                toBeUpdatedProb.name = 'TestName'
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    toBeUpdatedProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, toBeUpdatedProb)
                })
            })

            it('Tests Can Update Existing Problem Problem Text', (done) => {
                const toBeUpdatedProb = JSON.parse(JSON.stringify(problemJSON[0]))
                toBeUpdatedProb.problem_text = 'Test Problem Text'
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    toBeUpdatedProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, toBeUpdatedProb)
                })
            })

            it('Tests Can Update Existing Problem Link', (done) => {
                const toBeUpdatedProb = JSON.parse(JSON.stringify(problemJSON[0]))
                toBeUpdatedProb.link = 'test-problem-link'
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    toBeUpdatedProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, toBeUpdatedProb)
                })
            })

            it('Tests Can Update Existing Problem Test Case', (done) => {
                const toBeUpdatedProb = JSON.parse(JSON.stringify(problemJSON[0]))
                toBeUpdatedProb.test_case = 'Test Problem test case'
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    toBeUpdatedProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, toBeUpdatedProb)
                })
            })

            it('Tests Can Update Existing Problem Start Code', (done) => {
                const toBeUpdatedProb = JSON.parse(JSON.stringify(problemJSON[0]))
                toBeUpdatedProb.start_code= 'Test Problem starting code block'
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    toBeUpdatedProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, toBeUpdatedProb)
                })
            })

            it('Tests Can Update Existing Problem Difficulty', (done) => {
                const toBeUpdatedProb = JSON.parse(JSON.stringify(problemJSON[0]))
                toBeUpdatedProb.difficulty = 5
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    toBeUpdatedProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, toBeUpdatedProb)
                })
            })

            it('Tests Cannot Update Problem That Does Not Yet Exist', (done) => {
                // Use the problemJSON first problem as a template, then set ID
                // to some fake number that won't exist
                const nonExistantProb = JSON.parse(JSON.stringify(problemJSON[0]))
                nonExistantProb.id = 123456
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': adminToken})
                .send(
                    nonExistantProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 409, 'Problem does not exist.')
                })
            })
        })

        describe('Test Updating Problem Requires Admin', () => {
            it('Tests Updating an Individual Problem Requires Admin', (done) => {
                const toBeUpdatedProb = JSON.parse(JSON.stringify(problemJSON[0]))
                chai.request(app)
                .put(BASE_URL)
                .set({'x-auth-token': token})
                .send(
                    toBeUpdatedProb
                )
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 401, 'Access denied')
                })
            })
        })
    })

    describe('Test Can Delete Problems', () => {
        it('Tests Non-Admin Cannot Delete Problems', (done) => {
            const toDeleteID = problemJSON[0].id
            chai.request(app)
            .delete(BASE_URL + '/' + toDeleteID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 401, 'Access denied')
            })
        })

        it('Tests Can Delete Problem From Database', (done) => {
            const toDeleteID = problemJSON[0].id
            chai.request(app)
            .delete(BASE_URL + '/' + toDeleteID)
            .set({'x-auth-token': adminToken})
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                expect(res.body).to.equal(true)
                done()
            })
        })
    })

    describe('Test Can Get Problem(s)', () => {
        describe('Test Can Get Individual Problem Information', () => {

            it('Tests Getting Non-Numeric Problem Returns Empty Object', (done) => {
                chai.request(app)
                .get(BASE_URL + '/id/ab')
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, {})
                })
            })

            // TODO: Test that frontend still works since we edited backend for this...
            // Looks like it isn't used but do a full boot-up and play around anyway
            // This test relies on an unedited problemJSON[3] object - if a PUT
            // update test ends up altering the object, the object we use in this test
            // must also change
            it('Tests Getting Problem Returns Correct Problem Object', (done) => {
                const existingProb = problemJSON[3]
                const existingProbID = existingProb.id
                chai.request(app)
                .get(BASE_URL + '/id/' + existingProbID)
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObject(res, done, existingProb) 
                })
            })

            it('Tests Getting Problem With Invalid ID Returns Error', (done) => {
                chai.request(app)
                .get(BASE_URL + '/id/1234567')
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problem not found.')
                })
            })
        })

        describe('Test Can Get Multiple Problems Information', () => {
            const addedMongoDBIds = []
            // Add some problems individually to the DB and keep track of their
            // mongoDB IDs provided back to us.
            before(() => {
                const toAddProblems = problemJSON.slice(6,9)
                for (let prob of toAddProblems) {
                    chai.request(app)
                    .post(BASE_URL)
                    .set({'x-auth-token': adminToken})
                    .send(
                        prob
                    )
                    .end((err, res) => {
                        if (err) done(err)
                        addedMongoDBIds.push(res.body._id)
                    })
                }
            })

            it('Tests All Get Bulk Problems Validation Checks Are Properly Handled', (done) => {
                const url = BASE_URL + '/bulk'
                const badMongoID = '0'
                const reqs = [
                    {
                        reqBody : {},
                        err: 'Must provide array of problem IDs',
                    },
                    {
                        reqBody : {problems : []},
                        err: 'Must provide problems to update list with',
                    },
                    {
                        reqBody : {problems: [badMongoID]},
                        err: 'All problem IDs must be a valid MongoID',
                    },
                ]
                checkAllValidationResults(app, 'put', url, reqs, '', done)
            })

            it('Tests Returns 404 if No Problems Found', (done) => {
                const badProblemID = getFakeMongoDBid()
                chai.request(app)
                .put(BASE_URL + '/bulk')
                .send({
                    problems: [badProblemID],
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problems not found.')
                })
            })

            it('Tests Response Contains All Valid Problems Provided', (done) => {
                const usedProbs = problemJSON.slice(6,9)
                chai.request(app)
                .put(BASE_URL + '/bulk')
                .send({
                    problems: addedMongoDBIds,
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObjects(res, 'problems', done, usedProbs)
                })
            })
        })

        // NOTE: Tests here will need updating if the testProblems.json file used
        // changes.
        describe('Test Can Get Problems In ID Range', () => {
            it('Tests Can Get Problems In Defined Range', (done) =>{
                // Note that the later indices have earlier ids
                const addedIdStart = problemJSON[8].id
                const addedIdEnd = problemJSON[6].id
                const addedProblems = problemJSON.slice(6,9)
                chai.request(app)
                .get(BASE_URL + '/?start=' + addedIdStart + '&end=' + addedIdEnd)
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObjects(res, '', done, addedProblems)
                })
            })

            it('Tests Can Get Problems From Defined Start Without Defined End', (done)=> {
                const addedIdStart = problemJSON[8].id
                const addedProblems = problemJSON.slice(6,9)
                chai.request(app)
                .get(BASE_URL + '/?start=' + addedIdStart)
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObjects(res, '', done, addedProblems)
                })
            })

            it('Tests Can Get Problems up to Defined End Without Defined Start', (done) => {
                const addedIdEnd = problemJSON[6].id
                const addedProblems = problemJSON.slice(6,9)
                chai.request(app)
                .get(BASE_URL + '/?end=' + addedIdEnd)
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObjects(res, '', done, addedProblems)
                })
            })

            it('Tests Can Get All Problems', (done) => {
                const addedProblems = problemJSON.slice(6,9)
                chai.request(app)
                .get(BASE_URL)
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObjects(res, '', done, addedProblems)
                })
            })

            it('Tests Returns 404 if No Problems In Provided Range', (done) => {
                chai.request(app)
                .get(BASE_URL + '/?start=100000')
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'No problems found.')
                })
            })
        })

        // NOTE: Tests here will need updating if the testProblems.json file used
        // changes.
        describe('Test Can Search For Problem', () => {
            it('Tests Can Find Problem Based on Name', (done) => {
                const prob = problemJSON[6]
                const name = prob.name
                chai.request(app)
                .get(BASE_URL + '/name/' + name)
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObjects(res, 'problems', done, [prob])
                })
            })

            it('Tests Can Find Problem Based on Problem Text',(done) => {
                const prob = problemJSON[6]
                const text = prob.problem_text
                chai.request(app)
                .get(BASE_URL + '/name/' + text)
                .end((err, res) => {
                    if (err) done(err)
                    checkForReturnedObjects(res, 'problems', done, [prob])
                })
            })

            it('Tests Returns 404 when Provided No-Match Name/Text', (done) => {
                const invalidName = 'I Dont Exist As a Problem'
                chai.request(app)
                .get(BASE_URL + '/name/' + invalidName)
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'No problems found.')
                })
            })

            // TODO: This test returns {} - but I'm not sure where it's hitting
            // Need to fix this test at some point
            // it('Tests Returns 404 When Not Provided Search Term', (done) => {
            //     console.log('Doing 404 no term test')
            //     chai.request(app)
            //     .get(BASE_URL + '/name')
            //     .end((err, res) => {
            //         if (err) done(err)
            //         checkForCorrectErrors(res, done, 404, 'No problems found.')
            //     })
            // })
        })
    })
})
