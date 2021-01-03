const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const dotenv = require('dotenv') // For getting environ vars from .env file
dotenv.config({path: '../../../.env'}) // Config environmental vars to get admin user
const fs = require('fs'); // For reading local JSON file

const {checkForCorrectErrors, createTestUser,
        checkValidationResult, convertLeetCodeResToOurObjects,
        checkForAddedObject, checkForAddedIDs,
        checkAllValidationResults, createOrGetTokenForAdminUser,
        checkForAddedObjects} = require('../sharedTestFunctions.js')

const BASE_URL = '/api/lists'
// Note that the test is run at the root of the server module,
// and thus the path is defined as if we are at the root of the server folder
const TEST_PROBLEMS_PATH = './tests/Lists/listTestProblems.json'

describe('Lists API Tests' , () => {
    // Create a user to create lists for
    let token = ''
    before(async () => {
        try {
            const res = await createTestUser(app, 'listTest', 'listTest@test.com', 'test12')
            const body = res.body
            token = body.token
        } catch (error) {
            console.log('Hit error creating test user for Lists.')
            console.log(error)
            expect(false).to.equal(true)
        }
    })

    // Create admin account to use 
    let adminToken = ''
    before(async () => {
        // Create an admin user to add problems with
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
    // Insert some problems into our DB for usage during this test
    const testProblems = [] // store the leetcode IDs
    before((done) => {
        const rawData = fs.readFileSync(TEST_PROBLEMS_PATH)
        const asJson = JSON.parse(rawData)
        const probs = convertLeetCodeResToOurObjects(asJson)
        // Submit problems to the database
        chai.request(app)
        .post('/api/problems/bulk')
        .set({'x-auth-token': adminToken})
        .send({
            problems: probs,
        })
        .end((err, res) => {
            if (err) done(err)
            expect(res).to.have.status(200)
            const dummyFunc = () => {}
            const addedProbIds = []
            for (let prob of probs) {
                addedProbIds.push(prob.id)
            }
            // Check everything was added
            checkForAddedIDs(res, dummyFunc, addedProbIds, 'Added')
            // Add the response MongoIDs to our array
            for (let added of res.body.Added) {
                testProblems.push(added)
            }
            done()
        })
    })

    // Create a throwaway user to create 100 lists on
    let throwawayToken = ''
    before(async () => {
        try {
            const res = await createTestUser(app, 'throwaway', '', 'test12')
            const body = res.body
            throwawayToken = body.token
        } catch (error) {
            console.log('Hit error creating test user for Lists.')
            console.log(error)
            expect(false).to.equal(true)
        }
    })

    describe('Test Can Create Lists', () => {
        it('Tests Validation Checks Work Correctly', (done) => {
            const 
            reqs = [
                {
                    reqBody: {name: '', public: false},
                    err: 'Lists must be named.'
                },
                {
                    reqBody: {name: 'testName', public: 23},
                    err: 'Public must be set true or false'
                },
            ]
            checkAllValidationResults(app, 'post', BASE_URL, reqs, token, done)
        })

        it('Tests Can Create New List', (done) => {
            const list = {
                name: 'firstList',
                public: false,
            }
            chai.request(app)
            .post(BASE_URL)
            .set({'x-auth-token' : token})
            .send(list)
            .end((err, res) => {
                if (err) done(err)
                checkForAddedObject(res, done, list)
            })
        })

        // Helper function used to create a List
        // Called 100x to test our 100 list limit works as intended
        const addTestLists = (i) => {
            return new Promise((resolve) => {
                const dummyFunc = () => {}
                const list = {name: 'list', public: false}
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token': throwawayToken})
                .send(list)
                .end((err, res) => {
                    if (err) reject(err)
                    checkForAddedObject(res, dummyFunc, list)
                    resolve(res)
                })
            })
        }

        describe('Create Dummy Lists Then Test', async () => {
            // Repeat posting the list 100x so user has 100 lists created
            it('Makes 100 Lists for Throwaway User', async () => {
                for (let i = 0; i < 100; i++) {
                    await addTestLists(i)
                }
            })
        })

        // With the 100 lists created for the throwaway user, try to post list 101
        describe('Test Cannot Have Over 100 Lists for User', () => {
            it('Tests Cannot Have Over 100 Lists for User', (done) => {
                // Look for error on 101
                const list = {name: 'list', public: false}
                chai.request(app)
                .post(BASE_URL)
                .set({'x-auth-token' : throwawayToken})
                .send(list)
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 401, 'You cannot have more than 100 lists.')
                })
            })
        })
    })

    describe('Test Can Get Lists', () => {
        describe('Test Can Get All Lists', () => {
            it('Tests Can Get All Public Lists', (done) => {
                done()
            })
        })

        describe('Test Can Get Specific Lists', () => {

        })

        describe('Test Can Search Lists', () => {

        })
    })

    describe('Test Can Get Problems In List', () => {

    })

    describe('Test Can Copy Lists', () => {

    })

    describe('Test Can Edit Lists', () => {
        describe('Test Can Add Problems To List', () => {

        })

        describe('Test Can Remove Problems To List', () => {

        })

        describe('Test Can Remove Problems To List', () => {

        })

        describe('Test Can Bulk Edit List', () => {

        })

        describe('Test Can Update List Attributes', () => {

        })
    })

    describe('Test Can Delete List', () => {

    })

    describe('Test Private List Routes Are Private', () => {

    })
})