const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const fs = require('fs'); // For reading local JSON file

const {checkForCorrectErrors, checkAllValidationResults, 
        checkRoutesArePrivate, checkProblemStatusReturnedContainsProperties,
        dummyFunc,
    } = require('../sharedTestFunctions.js')

const {createTestUser, convertLeetCodeResToOurObjects,
        createOrGetTokenForAdminUser, addProblemStatus,
        addProblemsToDatabase,
    } = require('../sharedCreationFunctions.js')

const {getProbIdFromLCid, 
    } = require('../sharedGetters.js');
const { addDays } = require('../../utility/utility');

const BASE_URL = '/api/problem_status'
// Note that the test is run at the root of the server module,
// and thus the path is defined as if we are at the root of the server folder
const TEST_PROBLEMS_PATH = './tests/ProblemStatus/probStatusTestProblems.json'

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

    const testUser = 'probStatus'
    const testEmail = 'probStatus@test.com'
    const testPass = 'pass12'
    let token = ''
    before( async () => {
        try {
            const res = await createTestUser(app, testUser, testEmail, testPass)
            token = res.body.token
        } catch (error) {
            console.log('Failed to create ProblemStatus test user.')
            expect(true).to.equal(false)
        }
    })
    let adminToken = ''
    before(async () => {
        try {
            adminToken = await createOrGetTokenForAdminUser()
        } catch (error) {
            console.log('Could not get admin token in ProblemStatus tests', error)
            expect(true).to.be.equal(false)
        }
    })
    // Use this array to store time to next values for tests
    // Indices of the ttn should match indices for the problem arrays
    const ttns = []

    // Define some generic statuses to reuse
    const TIME_MULT = 10
    const genericPositiveStatus = {
        result: true,
        time_multiplier: TIME_MULT,
    }
    const genericNegativeStatus = {
        result: false,
        time_multiplier: TIME_MULT,
    }

    describe('Test Can Create Problem Status', () => {
        it('Tests Validation Checks Work Correctly', (done) => {
            const probId = testProblems[0]
            const reqs = [
                {
                    reqBody: {time_multiplier: 1.5},
                    err: 'Result for this attempt required.'
                },
                {
                    reqBody: {result: 'testName', time_multiplier: 1.5},
                    err: 'Result for this attempt must be boolean.'
                },
                {
                    reqBody: {result: true},
                    err: 'Multiplier for successful attempt required'
                },
                {
                    reqBody: {result: true, time_multiplier: 'test'},
                    err: 'Multiplier for successful attempt must be Number'
                },
            ]
            checkAllValidationResults(app, 'put', BASE_URL + '/' + probId, reqs, token, done)
        })

        it('Tests Cannot Create Status for Problem That Does Not Exist', (done) => {
            const probId = 1
            chai.request(app)
            .put(BASE_URL + '/' + probId)
            .set({'x-auth-token' : token})
            .send(genericPositiveStatus)
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'Problem does not exist.')
            })
        })

        it('Tests Can Create Status for Problem With Positive Status', async () => {
            const probId = testProblems[0]
            try {
                const body = await addProblemStatus(app, token, probId, genericPositiveStatus)
                // Most checks on the status itself are done above, but now check that the
                // next_submission time matches what we expect - 10 days in the future
                // Additionally, check the interval is time_multiplier provided
                return new Promise((resolve, reject) => {
                    const future = addDays(TIME_MULT)
                    const difInMs = Math.abs(future- new Date(body.next_submission))
                    expect(difInMs).to.be.lessThan(1000)
                    ttns[0] = body.next_submission
                    expect(body.interval).to.be.equal(TIME_MULT)
                    expect(body.results.success).to.be.equal(1)
                    resolve()
                })
            } catch (error) {
                console.log('Failed to create positive status', error)
                expect(true).to.equal(false)
            }
        })

        it('Tests Can Create Status for Problem With Negative Status', async () => {
            const probId = testProblems[1]
            try {
                const body = await addProblemStatus(app, token, probId, genericNegativeStatus)
                // Most checks on the status itself are done above, but now check that the
                // next_submission time matches what we expect - right now
                // Additionally, check the interval is time_multiplier provided
                return new Promise((resolve, reject) => {
                    const now = addDays(0)
                    const difInMs = Math.abs(now- new Date(body.next_submission))
                    ttns[1] = body.next_submission
                    expect(difInMs).to.be.lessThan(1000)
                    expect(body.interval).to.be.equal(1)
                    expect(body.results.incorrect).to.be.equal(1)
                    resolve()
                })
            } catch (error) {
                console.log('Failed to create negative status', error)
                expect(true).to.equal(false)
            }
        })
    })

    describe('Test Can Update Problem Status', () => {
        // Update and creation functions are the same, so we
        // can skip validation and error handling tests, since they're
        // handled above
        it('Tests Can Update Problem Status With Positive Status', (done) => {
            const probId = testProblems[0]
            chai.request(app)
            .put(BASE_URL + '/' + probId)
            .set({'x-auth-token' : token})
            .send(genericPositiveStatus)
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                checkProblemStatusReturnedContainsProperties(dummyFunc, body)
                // Check next_submission time is 100 days from now.
                const future = addDays(TIME_MULT * TIME_MULT)
                const difInMs = Math.abs(future- new Date(body.next_submission))
                ttns[0] = body.next_submission
                expect(difInMs).to.be.lessThan(1000)
                expect(body.interval).to.be.equal(TIME_MULT * TIME_MULT)
                expect(body.results.success).to.be.equal(2)
                done()
            })
        })

        it('Tests Can Update Problem Status With Negative Status', (done) => {
            const probId = testProblems[0]
            chai.request(app)
            .put(BASE_URL + '/' + probId)
            .set({'x-auth-token' : token})
            .send(genericNegativeStatus)
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                checkProblemStatusReturnedContainsProperties(dummyFunc, body)
                // Check next_submission time is tomorrow.
                const future = addDays(1)
                const difInMs = Math.abs(future- new Date(body.next_submission))
                ttns[0] = body.next_submission
                expect(difInMs).to.be.lessThan(1000)
                expect(body.interval).to.be.equal(1)
                expect(body.results.success).to.be.equal(2)
                expect(body.results.incorrect).to.be.equal(1)
                done()
            })
        })
    })

    describe('Test Can Get User\'s Problem Statuses', () => {
        describe('Test Can Get All of User\'s Problem Statuses', () => {

            it('Tests Returns Error If No Problem Statuses Exist', (done) => {
                chai.request(app)
                .get(BASE_URL)
                .set({'x-auth-token' : adminToken})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'No problem statuses found.')
                })
            })

            // Test relies on problem statuses being added in earlier tests
            it('Tests Returns User\'s Statuses', (done) => {
                chai.request(app)
                .get(BASE_URL)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    // Check that we got back the statuses for both added problems
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.be.an('array')
                    for (let i = 0; i < 2; i ++) {
                        const curProbStatus = body[i]
                        checkProblemStatusReturnedContainsProperties(dummyFunc, curProbStatus)
                        const lcId = dbIds[i]
                        expect(curProbStatus.problem).to.be.equal(lcId)
                    }
                    done()
                })
            })
        })

        describe('Test Can Get Individual Problem Status', () => {
            it('Tests Cannot Return Status for Problem That Does Not Exist', (done) => {
                const probId = 1
                chai.request(app)
                .get(BASE_URL + '/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problem does not exist.')
                })
            })

            it('Tests Cannot Get Status for Problem With No Status', (done) => {
                const probId = testProblems[2]
                chai.request(app)
                .get(BASE_URL + '/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'No status for this problem.')
                })
            })

            it('Tests Can Get Status for Specific Problem', (done) => {
                const probId = testProblems[0]
                chai.request(app)
                .get(BASE_URL + '/' + probId)
                .set({'x-auth-token' : token})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    checkProblemStatusReturnedContainsProperties(done, body)
                })
            })
        })
    })


    describe('Test Can Get Time of Next Submission For Problems', () => {
        it('Tests Validation Checks Work Correctly', (done) => {
            const reqs = [
                {
                    reqBody: {problems: ''},
                    err: 'Must provide array of problems.'
                },
                {
                    reqBody: {problems: ['1', '2']},
                    err: 'Must provide MongoDB ids for problems.'
                },
            ]
            checkAllValidationResults(app, 'put', BASE_URL + '/next_times', reqs, token, done)
        })

        it('Tests Can Get ProblemId to Next Sub Time Mapping for Problems with Status', (done) => {
            const probs = dbIds
            chai.request(app)
            .put(BASE_URL + '/next_times')
            .set({'x-auth-token' : token})
            .send({problems: probs})
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                const retIds = Object.keys(body)
                for (let i = 0; i < 2; i++) {
                    expect(retIds[i]).to.be.equal(probs[i])
                    expect(body[retIds[i]]).to.be.equal(ttns[i])
                }
                done()
            })
        })

        it('Tests Can Get ProblemId to Next Sub Time Mapping for Problems without Status', (done) => {
            const probs = [dbIds[2]]
            chai.request(app)
            .put(BASE_URL + '/next_times')
            .set({'x-auth-token' : token})
            .send({problems: probs})
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                const retId = Object.keys(body)[0]
                expect(retId).to.be.equal(probs[0])
                const now = addDays(0)
                const difInMs = Math.abs(now- new Date(body[retId]))
                ttns[2] = body[retId]
                expect(difInMs).to.be.lessThan(1000)
                done()
            })
        })
    })
 
    // TODO: Eventually the underlying reset route will be updated and this will need to be
    // be updated as well
    describe('Test Can Reset Problem Status', () => {
        it('Tests Cannot Reset Problem Status for Problem that Does Not Exist', (done) => {
            const probId = 1
            chai.request(app)
            .put(BASE_URL + '/reset/' + probId)
            .set({'x-auth-token' : token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'Problem does not exist.')
            })
        })

        it('Tests Can Reset Problem Status for Problem With Existing Status', (done) => {
            const probId = testProblems[0]
            chai.request(app)
            .put(BASE_URL + '/reset/' + probId)
            .set({'x-auth-token' : token})
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                checkProblemStatusReturnedContainsProperties(dummyFunc, body)
                expect(body.interval).to.be.equal(1)
                expect(body.results.success).to.be.equal(0)
                expect(body.results.incorrect).to.be.equal(0)
                const now = addDays(0)
                const difInMs = Math.abs(now- new Date(body.next_submission))
                ttns[0] = body.next_submission
                expect(difInMs).to.be.lessThan(1000)
                done()
            })
        })

        it('Tests Can Reset Problem Status for Problem Without Existing Status', (done) => {
            const probId = testProblems[2]
            chai.request(app)
            .put(BASE_URL + '/reset/' + probId)
            .set({'x-auth-token' : token})
            .end((err, res) => {
                if (err) done(err)
                expect(res).to.have.status(200)
                const body = res.body
                checkProblemStatusReturnedContainsProperties(dummyFunc, body)
                expect(body.interval).to.be.equal(1)
                expect(body.results.success).to.be.equal(0)
                expect(body.results.incorrect).to.be.equal(0)
                const now = addDays(0)
                const difInMs = Math.abs(now- new Date(body.next_submission))
                ttns[2] = body.next_submission
                expect(difInMs).to.be.lessThan(1000)
                done()
            })
        })
    })

    it('Tests Private Routes Require Auth', (done) => {
        const routes = {}
        routes[ BASE_URL] = 'get'
        routes[ (BASE_URL + '/12') ] = 'get'
        routes[ (BASE_URL + '/next_times/') ] = 'put'
        routes[ (BASE_URL + '/12') ] = 'put'
        routes[ (BASE_URL + '/reset/12') ] = 'put'
        checkRoutesArePrivate(done, app, routes)
    })
})