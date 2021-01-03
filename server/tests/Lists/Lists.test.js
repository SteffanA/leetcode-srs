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
        checkForAddedObjects, checkForEmptyArray,
        getFakeMongoDBid} = require('../sharedTestFunctions.js')

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

    const addedPublicList = {
        name: 'firstList',
        public: true,
    }

    // Private List to be added by 'token' user
    const addedOwnPrivateList = {
        name: 'secondList',
        public: false,
    }

    // Store the MongoDB _id field for a public and private list
    // for future use. Private list ID is not owned by 'token' user,
    // but private owned list is.
    let publicListId = ''
    let privateListId = ''
    let privateOwnListId = ''

    describe('Test User Cannot Have Over 100 Lists', () => {
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
                    const r = await addTestLists(i)
                    // Store the _id of the last added list for other tests
                    if (i == 99) {
                        privateListId = r.body._id
                    }
                }
            })
        })

        // // With the 100 lists created for the throwaway user, try to post list 101
        describe('Test Wrapper', () => {
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

    // Run tests that rely on no public lists, or lists under the 'token'
    // user existing here.
    describe('Test Cannot Get List When None Exist', () => {
        it('Tests No Public Lists Are Retrieved When None Exist', (done) => {
            chai.request(app)
            .get(BASE_URL)
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'No lists found.')
            })
        })

        it('Tests No Private Lists Are Retrieved When None Exist', (done) => {
            chai.request(app)
            .get(BASE_URL + '/own')
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'You do not own any lists.')
            })
        })
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

        it('Tests Can Create New Public List', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .set({'x-auth-token' : token})
            .send(addedPublicList)
            .end((err, res) => {
                if (err) done(err)
                const dummyFunc = () => {}
                checkForAddedObject(res, dummyFunc, addedPublicList)
                publicListId = res.body._id
                done()
            })
        })

        it('Tests Can Create New Private List', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .set({'x-auth-token' : token})
            .send(addedOwnPrivateList)
            .end((err, res) => {
                if (err) done(err)
                const dummyFunc = () => {}
                checkForAddedObject(res, dummyFunc, addedOwnPrivateList)
                privateOwnListId = res.body._id
                done()
            })
        })
    })

    describe('Test Can Get Lists', () => {
        it('Tests Can Get All Public Lists', (done) => {
            chai.request(app)
            .get(BASE_URL)
            .end((err, res) => {
                if (err) done(err)
                checkForAddedObjects(res, '', done, [addedPublicList])
            })
        })

        it('Tests Can Get Specific List', (done) => {
            chai.request(app)
            .get(BASE_URL + '/public/id/' + publicListId)
            .end((err, res) => {
                if (err) done(err)
                checkForAddedObject(res, done, addedPublicList)
            })
        })

        it('Tests Cannot Get Private List', (done) => {
            chai.request(app)
            .get(BASE_URL + '/public/id/' + privateListId)
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        it('Tests Cannot Get List That Does Not Exist', (done) => {
            const badID = getFakeMongoDBid()
            chai.request(app)
            .get(BASE_URL + '/public/id/' + badID)
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        it('Tests Can Get Own Lists', (done) => {
            chai.request(app)
            .get(BASE_URL + '/own/')
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForAddedObjects(res, '', done, [addedPublicList])
            })
        })

        it('Tests Can Get Own Private List', (done) => {
            chai.request(app)
            .get(BASE_URL + '/private/' + privateOwnListId)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForAddedObject(res, done, addedOwnPrivateList)
            })
        })

        it('Tests Non-Owner Cannot Get Private List Directly', (done) => {
            chai.request(app)
            .get(BASE_URL + '/private/' + privateOwnListId)
            .set({'x-auth-token': throwawayToken})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        it('Tests Cannot Get Private List That Does Not Exist', (done) => {
            const invalidMongoId = getFakeMongoDBid()
            chai.request(app)
            .get(BASE_URL + '/private/' + invalidMongoId)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        describe('Test Can Search Lists', () => {
            it('Tests Search Finds Correct Lists', (done) => {
                const term = 'list'
                chai.request(app)
                .get(BASE_URL + '/public/search/' + term)
                .end((err, res) => {
                    if (err) done(err)
                    checkForAddedObjects(res, '', done, [addedPublicList])
                })
            })

            it('Tests Search Does Not Contain Incorrect Lists', (done) => {
                const term = 'dne'
                chai.request(app)
                .get(BASE_URL + '/public/search/' + term)
                .end((err, res) => {
                    if (err) done(err)
                    checkForEmptyArray(res, '', done)
                })
            })
        })
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

    describe('Test Can Get Problems In List', () => {
        it('Tests Can Get All Problems In a List', (done) => {
            done()
        })

        it('Tests Can Get All Problems In a List Sorted By Time To Next Sub', (done) => {
            done()
        })
    })

    describe('Test Can Copy Lists', () => {

    })


    describe('Test Can Delete List', () => {

    })

    describe('Test Private List Routes Are Private', () => {

    })
})