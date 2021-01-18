const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const fs = require('fs'); // For reading local JSON file

const {checkForCorrectErrors, checkAllValidationResults, 
        checkSubmissionReturnedContainsProperties,
        dummyFunc,
    } = require('../sharedTestFunctions.js')

const {createTestUser, convertLeetCodeResToOurObjects,
        addProblemsToDatabase,
    } = require('../sharedCreationFunctions.js')

const {getProbIdFromLCid, getFakeMongoDBid, 
    } = require('../sharedGetters.js');
const { addDays } = require('../../utility/utility');

const BASE_URL = '/api/submissions'
// Note that the test is run at the root of the server module,
// and thus the path is defined as if we are at the root of the server folder
const TEST_PROBLEMS_PATH = './tests/Submissions/submissionsTestProblems.json'

// Define some generic re-usable submissions
const genericFullSubmission = {
    result: true,
    time_spent: 150,
    text: 'some text',
    mem_used: 50,
    execution_time: 25,
}
const genericMinimalSubmission = {
    result: true,
    time_spent: 150,
}

describe('Problem Status API Tests', () => {
    // Insert some problems into our DB for usage during this test
    const testProblems = [] // store the leetcode IDs
    before( async () => {
        const rawData = fs.readFileSync(TEST_PROBLEMS_PATH)
        const asJson = JSON.parse(rawData)
        const probs = convertLeetCodeResToOurObjects(asJson)
        // Submit problems to the database
        const addedProbs = await addProblemsToDatabase(app, probs)
        testProblems.push(...addedProbs)
    })

    // Get the MongoDB _ids for our test problems
    const dbIds = []
    before(async () => {
        for (let i = 0; i < testProblems.length; i++) {
            const curProbLcId = testProblems[i]
            const dbId = await getProbIdFromLCid(app, curProbLcId)
            dbIds.push(dbId)
        }
    })

    const testUser = 'submissions'
    const testEmail = 'submissions@test.com'
    const testPass = 'pass12'
    let token = ''
    before( async () => {
        try {
            const res = await createTestUser(app, testUser, testEmail, testPass)
            token = res.body.token
        } catch (error) {
            console.log('Failed to create Submissions test user.')
            expect(true).to.equal(false)
        }
    })
    describe('Test Can Create Submission', () => {
        it('Tests Validation Checks Work Correctly', (done) => {
            const probId = testProblems[0]
            const reqs = [
                {
                    reqBody: {time_spent: 150},
                    err: 'Submission result is required'
                },
                {
                    reqBody: {result: 'testName', time_spent: 150},
                    err: 'Submission result is must be boolean'
                },
                {
                    reqBody: {result: true},
                    err: 'Time spent on submission is required'
                },
                {
                    reqBody: {result: true, time_spent: 'test'},
                    err: 'Time spent on submission must be number'
                },
                {
                    reqBody: {result: true, time_spent: 150, mem_used: 'test'},
                    err: 'Submission\'s memory used must be number'
                },
                {
                    reqBody: {result: true, time_spent: 150, execution_time: 'test'},
                    err: 'Submission\'s execution time used must be number'
                },
                {
                    reqBody: {result: true, time_spent: 150, text: 1},
                    err: 'Submission\'s text must be String'
                },
            ]
            checkAllValidationResults(app, 'post', BASE_URL + '/' + probId, reqs, token, done)
        })

        it('Tests Cannot Create Submission for Problem that Does Not Exist', (done) => {
            const probId = 1
            chai.request(app)
            .post(BASE_URL + '/' + probId)
            .set({'x-auth-token' : token})
            .send(genericMinimalSubmission)
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'Problem does not exist.')
            })
        })

        it('Tests Can Create Submission for Problem Without ProblemStatus', (done) => {
            const probId = testProblems[0]
            chai.request(app)
            .post(BASE_URL + '/' + probId)
            .set({'x-auth-token' : token})
            .send(genericFullSubmission)
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                checkSubmissionReturnedContainsProperties(dummyFunc, body)
                // Check the optional properties we sent are provided
                expect(body).to.have.property('mem_used')
                expect(body).to.have.property('text')
                expect(body).to.have.property('execution_time')
                // Check that the resulting properties match what we sent
                for (let prop of Object.keys(genericFullSubmission)) {
                    const sentProp = genericFullSubmission[prop]
                    expect(sentProp).to.equal(body[prop])
                }
                // Check the submission date is accurate
                const now = addDays(0)
                const difInMs = Math.abs(now- new Date(body.submit_date))
                expect(difInMs).to.be.lessThan(1000)
                done()
            })
        })

        // Basically a copy of the above, but expects the above to be done first
        it('Tests Can Create Submission for Problem With ProblemStatus', (done) => {
            const probId = testProblems[0]
            chai.request(app)
            .post(BASE_URL + '/' + probId)
            .set({'x-auth-token' : token})
            .send(genericFullSubmission)
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                checkSubmissionReturnedContainsProperties(dummyFunc, body)
                // Check the optional properties we sent are provided
                expect(body).to.have.property('mem_used')
                expect(body).to.have.property('text')
                expect(body).to.have.property('execution_time')
                // Check that the resulting properties match what we sent
                for (let prop of Object.keys(genericFullSubmission)) {
                    const sentProp = genericFullSubmission[prop]
                    expect(sentProp).to.equal(body[prop])
                }
                // Check the submission date is accurate
                const now = addDays(0)
                const difInMs = Math.abs(now- new Date(body.submit_date))
                expect(difInMs).to.be.lessThan(1000)
                done()
            })
        })

        it('Tests Can Create Submission With Only Result and TimeSpent', (done) => {
            const probId = testProblems[0]
            chai.request(app)
            .post(BASE_URL + '/' + probId)
            .set({'x-auth-token' : token})
            .send(genericMinimalSubmission)
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                checkSubmissionReturnedContainsProperties(dummyFunc, body)
                // Check that the resulting properties match what we sent
                for (let prop of Object.keys(genericMinimalSubmission)) {
                    const sentProp = genericMinimalSubmission[prop]
                    expect(sentProp).to.equal(body[prop])
                }
                // Check the submission date is accurate
                const now = addDays(0)
                const difInMs = Math.abs(now- new Date(body.submit_date))
                expect(difInMs).to.be.lessThan(1000)
                done()
            })
        })
    })

    describe('Test Can Get Submissions', () => {
        describe('Test Can Get Individual Problem Submissions via LC ID', () => {
            it('Tests Cannot Get Submissions for Problem that Does Not Exist', (done) => {
                const probId = 1
                chai.request(app)
                .get(BASE_URL + '/lc/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problem does not exist.')
                })
            })

            it('Tests Cannot Get Submissions for Problem When None Exist', (done) => {
                const probId = testProblems[1]
                chai.request(app)
                .get(BASE_URL + '/lc/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'No data for this problem.')
                })
            })

            // This test relies on us having submitted three seperate submissions
            // for the same problem
            it('Tests Can Get Submission via Valid LeetCode ID', (done) => {
                const probId = testProblems[0]
                chai.request(app)
                .get(BASE_URL + '/lc/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.be.an('array')
                    expect(body.length).to.be.equal(3)
                    // Check each submission for the minimal properties
                    for (let sub of body) {
                        checkSubmissionReturnedContainsProperties(dummyFunc, sub)
                        // Check that the resulting properties match what we sent
                        for (let prop of Object.keys(genericMinimalSubmission)) {
                            const sentProp = genericMinimalSubmission[prop]
                            expect(sentProp).to.equal(sub[prop])
                        }
                    }
                    done()
                })
            })
        })

        describe('Test Can Get Individual Problem Submissions via MongoDB _ID', () => {
            it('Tests Cannot Get Submissions for Problem that Does Not Exist', (done) => {
                const probId = getFakeMongoDBid()
                chai.request(app)
                .get(BASE_URL + '/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problem does not exist.')
                })
            })

            it('Tests Cannot Get Submissions for Problem When None Exist', (done) => {
                const probId = dbIds[1]
                chai.request(app)
                .get(BASE_URL + '/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'No data for this problem.')
                })
            })

            it('Tests Can Get Submission via Valid MongoDB ID', (done) => {
                const probId = dbIds[0]
                chai.request(app)
                .get(BASE_URL + '/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.be.an('array')
                    expect(body.length).to.be.equal(3)
                    // Check each submission for the minimal properties
                    for (let sub of body) {
                        checkSubmissionReturnedContainsProperties(dummyFunc, sub)
                        // Check that the resulting properties match what we sent
                        for (let prop of Object.keys(genericMinimalSubmission)) {
                            const sentProp = genericMinimalSubmission[prop]
                            expect(sentProp).to.equal(sub[prop])
                        }
                    }
                    done()
                })
            })
        })
    })
})