const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const dotenv = require('dotenv') // For getting environ vars from .env file
dotenv.config({path: '../../../.env'}) // Config environmental vars to get admin user
const fs = require('fs'); // For reading local JSON file

const {checkForCorrectErrors, createTestUser,
        checkValidationResult, convertLeetCodeResToOurObjects,
        checkForReturnedObject, checkForAddedIDs,
        checkAllValidationResults, createOrGetTokenForAdminUser,
        checkForReturnedObjects, checkForEmptyArray,
        getFakeMongoDBid, checkForNewIdValueInResponseObject,
        checkForValidAddition, checkIDsDoNotExistAsPartOfResObjects,
        checkIdNotContainedInResArray,
        checkForAddedIDsAsPartOfResObjects,
        checkRoutesArePrivate} = require('../sharedTestFunctions.js')

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

    // Create a user to create 100 lists on
    let privateListUser = ''
    before(async () => {
        try {
            const res = await createTestUser(app, 'throwaway', '', 'test12')
            const body = res.body
            privateListUser = body.token
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
                .set({'x-auth-token': privateListUser})
                .send(list)
                .end((err, res) => {
                    if (err) reject(err)
                    checkForReturnedObject(res, dummyFunc, list)
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
                .set({'x-auth-token' : privateListUser})
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
                    reqBody: {name: 'testName'},
                    err: 'Lists must be set true or false'
                },
                {
                    reqBody: {name: 'testName', public: 23},
                    err: 'Public must be set as a bool'
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
                checkForReturnedObject(res, dummyFunc, addedPublicList)
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
                checkForReturnedObject(res, dummyFunc, addedOwnPrivateList)
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
                checkForReturnedObjects(res, '', done, [addedPublicList])
            })
        })

        it('Tests Can Get Specific List', (done) => {
            chai.request(app)
            .get(BASE_URL + '/public/id/' + publicListId)
            .end((err, res) => {
                if (err) done(err)
                checkForReturnedObject(res, done, addedPublicList)
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
                checkForReturnedObjects(res, '', done, [addedPublicList])
            })
        })

        it('Tests Can Get Own Private List', (done) => {
            chai.request(app)
            .get(BASE_URL + '/private/' + privateOwnListId)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForReturnedObject(res, done, addedOwnPrivateList)
            })
        })

        it('Tests Non-Owner Cannot Get Private List Directly', (done) => {
            chai.request(app)
            .get(BASE_URL + '/private/' + privateOwnListId)
            .set({'x-auth-token': privateListUser})
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
                    checkForReturnedObjects(res, '', done, [addedPublicList])
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
            it('Tests Can Add a Problem To List', (done) => {
                const problemToAdd = testProblems[0]
                const getUrl = '/api/problems/id/' + problemToAdd
                const reqUrl = BASE_URL + '/add/' + publicListId + '/' + problemToAdd
                checkForNewIdValueInResponseObject(app, done, token, getUrl, 'put', reqUrl, 'problems')
            })

            it('Tests Cannot Add Problem To List User Does Not Own', (done) => {
                const problemToAdd = testProblems[1]
                chai.request(app)
                .put(BASE_URL + '/add/' + publicListId + '/' + problemToAdd)
                .set({'x-auth-token': adminToken})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 401, 'Cannot add to a list you did not create.')
                })
            })

            it('Tests Cannot Add Problem To List That Does Not Exist', (done) => {
                const problemToAdd = testProblems[0]
                const badListId = getFakeMongoDBid()
                chai.request(app)
                .put(BASE_URL + '/add/' + badListId + '/' + problemToAdd)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Add Problem That Does Not Exist To List', (done) => {
                const problemToAdd = -120
                chai.request(app)
                .put(BASE_URL + '/add/' + publicListId + '/' + problemToAdd)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problem not found.')
                })
            })

            it('Tests Cannot Add Problem When List ID Provided Is Not MongoID', (done) => {
                const problemToAdd = testProblems[0]
                chai.request(app)
                .put(BASE_URL + '/add/' + 12 + '/' + problemToAdd)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Add Problem When Problem Already In List', (done) => {
                const problemToAdd = testProblems[0]
                chai.request(app)
                .put(BASE_URL + '/add/' + publicListId + '/' + problemToAdd)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 409, 'Problem already a part of this list.')
                })
            })
        })

        describe('Test Can Remove Problems From List', () => {
            it('Tests Can Remove a Problem From List', (done) => {
                const problemToRemove = testProblems[0]
                const getUrl = '/api/problems/id/' + problemToRemove 
                const reqUrl = BASE_URL + '/remove/' + publicListId + '/' + problemToRemove
                checkIdNotContainedInResArray(app, done, token, getUrl, 'put', reqUrl, 'problems')
            })

            it('Tests Cannot Remove Problem From List User Does Not Own', (done) => {
                const problemToRemove = testProblems[0]
                chai.request(app)
                .put(BASE_URL + '/remove/' + publicListId + '/' + problemToRemove)
                .set({'x-auth-token': adminToken})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 401, 'Cannot delete from a list you did not create.')
                })
            })

            it('Tests Cannot Remove Problem From List That Does Not Exist', (done) => {
                const badListId = getFakeMongoDBid()
                const problemToRemove = testProblems[0]
                chai.request(app)
                .put(BASE_URL + '/remove/' + badListId + '/' + problemToRemove)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Add Problem That Does Not Exist To List', (done) => {
                const problemToRemove = -120
                chai.request(app)
                .put(BASE_URL + '/remove/' + publicListId + '/' + problemToRemove)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problem not found.')
                })
            })

            it('Tests Cannot Remove Problem When List ID Provided Is Not MongoID', (done) => {
                const problemToRemove = testProblems[0]
                chai.request(app)
                .put(BASE_URL + '/remove/' + 12 + '/' + problemToRemove)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Remove Problem When Problem Not In List', (done) => {
                const problemToRemove = testProblems[0]
                chai.request(app)
                .put(BASE_URL + '/remove/' + publicListId + '/' + problemToRemove)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'Problem not part of this list.')
                })
            })
        })

        describe('Test Can Bulk Edit List', () => {
            // This function uses the MongoDB ID, unlike other list add/remove functions
            // that use the LeetCode ID.  Gather a few IDs to use for this batch of tests
            const testProblemMongoIds = []
            before(() => {
                // When we get our problems in the before for this test suite,
                // they are added such that the highest LC id is in the first element
                const highestProblemId = testProblems[0]
                chai.request(app)
                .get('/api/problems?start=&end=' + highestProblemId)
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.be.an('array')
                    for (let prob of body) {
                        expect(prob).to.have.property('_id')
                        testProblemMongoIds.push(prob._id)
                    }
                })
            })
            it('Tests Bulk List Edit Validation Checks Work Correctly', (done) => {
                const problemId = testProblemMongoIds[0]
                const reqs = [
                    {
                        reqBody: {},
                        err: 'Must provide problems to update list with'
                    },
                    {
                        reqBody: {problems: ''},
                        err: 'Must provide array of problem IDs'
                    },
                    {
                        reqBody: {problems: [{'smth' : problemId}]},
                        err: 'All problems must have an ID'
                    },
                    {
                        reqBody: {problems: [{ 'id' : -120}]},
                        err: 'All problem IDs must be a valid MongoID'
                    },
                    {
                        reqBody: {problems: [{ 'id' : problemId}]},
                        err: 'All problems must declare if we\'re adding or removing.'
                    },
                    {
                        reqBody: {problems: [{'id': problemId, 'add' : []}]},
                        err: 'All problems must provide bool for adding.'
                    },
                ]
                const url = BASE_URL + '/bulk/' + publicListId
                checkAllValidationResults(app, 'put', url, reqs, token, done)
            })

            it('Tests Can Bulk Add Problems to List', (done) => {
                chai.request(app)
                .put(BASE_URL + '/bulk/' + publicListId)
                .set({'x-auth-token': token})
                .send({problems: [
                    {'id': testProblemMongoIds[0], 'add' : true},
                    {'id': testProblemMongoIds[1], 'add' : true},
                    {'id': testProblemMongoIds[2], 'add' : true},
                    {'id': testProblemMongoIds[3], 'add' : true},
                ]})
                .end((err, res) => {
                    if (err) done(err)
                    // Alter the body a bit to fit our verify function, once
                    // we have verified that the body comes in the form we expect
                    let body = res.body
                    expect(body).to.have.property('list')
                    expect(body.list).to.have.property('problems')
                    body.problems = body.list.problems
                    checkForAddedIDsAsPartOfResObjects(res, done, testProblemMongoIds.slice(0,4), 'problems')
                })
            })

            // Note this test removes 2 items from the list, whereas prior test added 4
            // This is so we can test simultaneous add and removal in the next test
            it('Tests Can Bulk Remove Problems From List', (done) => {

                chai.request(app)
                .put(BASE_URL + '/bulk/' + publicListId)
                .set({'x-auth-token': token})
                .send({problems: [
                    {'id': testProblemMongoIds[0], 'add' : false},
                    {'id': testProblemMongoIds[1], 'add' : false},
                ]})
                .end((err, res) => {
                    if (err) done(err)
                    // Alter the body a bit to fit our verify function, once
                    // we have verified that the body comes in the form we expect
                    let body = res.body
                    expect(body).to.have.property('list')
                    expect(body.list).to.have.property('problems')
                    body.problems = body.list.problems
                    checkIDsDoNotExistAsPartOfResObjects(res, done, testProblemMongoIds.slice(0,2), 'problems')
                })
            })
            
            it('Tests Can Bulk Add and Remove Problems from List Simultaneously', (done) => {
                chai.request(app)
                .put(BASE_URL + '/bulk/' + publicListId)
                .set({'x-auth-token': token})
                .send({problems: [
                    {'id': testProblemMongoIds[0], 'add' : true},
                    {'id': testProblemMongoIds[1], 'add' : true},
                    {'id': testProblemMongoIds[2], 'add' : false},
                    {'id': testProblemMongoIds[3], 'add' : false},
                ]})
                .end((err, res) => {
                    if (err) done(err)
                    // Alter the body a bit to fit our verify function, once
                    // we have verified that the body comes in the form we expect
                    let body = res.body
                    expect(body).to.have.property('list')
                    expect(body.list).to.have.property('problems')
                    body.problems = body.list.problems
                    // define dummy function to pass to first test helper so we can test both
                    // addition and removal
                    const dummyFunc = () => {}
                    checkForAddedIDsAsPartOfResObjects(res, dummyFunc, testProblemMongoIds.slice(0,2), 'problems')
                    checkIDsDoNotExistAsPartOfResObjects(res, done, testProblemMongoIds.slice(2,4), 'problems')
                })
            })
            
            it('Tests Cannot Bulk Edit List That Does Not Exist', (done) => {
                const problemId = testProblemMongoIds[0]
                const badListId = getFakeMongoDBid()
                chai.request(app)
                .put(BASE_URL + '/bulk/' + badListId)
                .set({'x-auth-token': token})
                .send({problems: [{'id': problemId, 'add' : true}]})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Bulk Edit List When Given Non MongoID', (done) => {
                const problemId = testProblemMongoIds[0]
                chai.request(app)
                .put(BASE_URL + '/bulk/' + 120)
                .set({'x-auth-token': token})
                .send({problems: [{'id': problemId, 'add' : true}]})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Bulk Edit List That User Does Not Own', (done) => {
                const problemId = testProblemMongoIds[0]
                chai.request(app)
                .put(BASE_URL + '/bulk/' + publicListId)
                .set({'x-auth-token': adminToken})
                .send({problems: [{'id': problemId, 'add' : true}]})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 401, 'Cannot update a list you did not create.')
                })
            })

            it('Tests Cannot Bulk Update with Problem That Does Not Exist', (done) => {
                const badProblemId = getFakeMongoDBid()
                chai.request(app)
                .put(BASE_URL + '/bulk/' + publicListId)
                .set({'x-auth-token': token})
                .send({problems: [{'id': badProblemId, 'add' : true}]})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('errors')
                    expect(body.errors).to.contain('Could not find problem with ID ' + badProblemId)
                    done()
                })
            })

            it('Tests Cannot Bulk Update Add Problem That Is Already In List', (done) => {
                chai.request(app)
                .put(BASE_URL + '/bulk/' + publicListId)
                .set({'x-auth-token': token})
                .send({problems: [
                    {'id': testProblemMongoIds[0], 'add' : true},
                ]})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('errors')
                    expect(body.errors).to.contain('Problem already part of list: ID ' + testProblemMongoIds[0])
                    done()
                })
            })

            it('Tests Cannot Bulk Update Remove Problem That Is Not In List', (done) => {
                chai.request(app)
                .put(BASE_URL + '/bulk/' + publicListId)
                .set({'x-auth-token': token})
                .send({problems: [
                    {'id': testProblemMongoIds[2], 'add' : false},
                ]})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('errors')
                    expect(body.errors).to.contain('Problem not part of list: ID ' + testProblemMongoIds[2])
                    done()
                })
            })

        })

        describe('Test Can Update List Non-Problem Attributes', () => {
            it('Tests Can Update List Name', (done) => {
                const newName = 'switchedName'
                chai.request(app)
                .put(BASE_URL + '/' + privateListId)
                .set({'x-auth-token': privateListUser})
                .send({name : newName})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('name')
                    expect(body.name).to.be.equal(newName)
                    done()
                })
            })

            it('Tests Can Update List Public Status', (done) => {
                chai.request(app)
                .put(BASE_URL + '/' + privateListId)
                .set({'x-auth-token': privateListUser})
                .send({public: true})
                .end((err, res) => {
                    if (err) done(err)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('public')
                    expect(body.public).to.be.equal(true)
                    done()
                })
            })

            it('Tests Cannot Update List Attributes for List That Does Not Exist', (done) => {
                const badId = getFakeMongoDBid()
                chai.request(app)
                .put(BASE_URL + '/' + badId)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Update List Attributes for When Provided Non-MongoDB ID', (done) => {
                chai.request(app)
                .put(BASE_URL + '/' + 1)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 404, 'List not found.')
                })
            })

            it('Tests Cannot Update List Attributes for List Not Owned', (done) => {
                chai.request(app)
                .put(BASE_URL + '/' + publicListId)
                .set({'x-auth-token': adminToken})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 401, 'Cannot update a list you did not create.')
                })
            })

            it('Tests Cannot Update List Attributes for Public List', (done) => {
                chai.request(app)
                .put(BASE_URL + '/' + publicListId)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    checkForCorrectErrors(res, done, 403, 'Cannot update a public list\'s non-problem attributes.')
                })
            })
        })
    })

    describe('Test Can Get Problems In List', () => {
        // Insert problems into our test list
        before(() => {

        })
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
        // Create a list under token user to delete later
        let deleteId = ''
        before(() => {
            const deleteList = {name: 'deleteMe', public: false}
            chai.request(app)
            .post(BASE_URL)
            .set({'x-auth-token' : token})
            .send(deleteList)
            .end((err, res) => {
                expect(res).to.have.status(200)
                const body = res.body
                expect(body).to.have.property('_id')
                deleteId = body._id
            })
        })

        it('Tests Cannot Delete Public List', (done) => {
            chai.request(app)
            .delete(BASE_URL + '/' + publicListId)
            .set({'x-auth-token' : token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 403, 'Cannot delete a public list.')
            })
        })

        it('Tests Cannot Delete List When Provided Non MongoDB ID', (done) => {
            chai.request(app)
            .delete(BASE_URL + '/' + 1)
            .set({'x-auth-token' : token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        it('Tests Cannot Delete List That Does Not Exist', (done) => {
            const badId = getFakeMongoDBid()
            chai.request(app)
            .delete(BASE_URL + '/' + badId)
            .set({'x-auth-token' : token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        it('Tests Cannot Delete List That Does Not Belong to User', async () => {
            // Helper function to create a list to use before test executes
            const createList = () => {
                return new Promise((resolve, reject) => {
                    chai.request(app)
                    .post(BASE_URL)
                    .set({'x-auth-token' : token})
                    .send({name: 'delete', public: false})
                    .end((err, res) => {
                        if (err) reject(err)
                        // Check the test list posted successfully and store the _id
                        expect(res).to.have.status(200)
                        const body = res.body
                        expect(body).to.have.property('_id')
                        resolve(body._id)
                    })
                })
            }

            // First create a new private list to use for this test
            const newListId = await createList()
            // Now try to delete it under a different token
            return new Promise((resolve, reject) => {
                chai.request(app)
                .delete(BASE_URL + '/' + newListId)
                .set({'x-auth-token' : adminToken})
                .end((err, res) => {
                    if (err) reject(err)
                    checkForCorrectErrors(res, resolve, 401, 'Cannot delete a list you did not create.')
                })
            })
        })


        it('Tests Can Delete List', async () => {
            // Helper function to ensure we delete first then check lists
            const deleteList = () => {
                return new Promise((resolve, reject) => {
                    chai.request(app)
                    .delete(BASE_URL + '/' + deleteId)
                    .set({'x-auth-token' : token})
                    .end((err, res) => {
                        if (err) reject(err)
                        expect(res).to.have.status(200)
                        const body = res.body
                        expect(body).to.have.property('msg')
                        expect(body.msg).to.equal('List removed')
                        resolve(body.msg)
                    })
                })
            }
            // Check we can delete the list
            await deleteList()
            // Check the user's lists do not contain the list ID
            return new Promise((resolve, reject) => {
                chai.request(app)
                .get(BASE_URL + '/own/')
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) reject(err)
                    checkIDsDoNotExistAsPartOfResObjects(res, resolve, [deleteId])
                })
            })
        })
    })

    it('Tests Private List Routes Are Private', (done) => {
        const routes = {}
        routes[ BASE_URL+'/own'] = 'get'
        routes[ (BASE_URL + '/private/12') ] = 'get'
        routes[ (BASE_URL + '/12/problems/') ] = 'get'
        routes[ BASE_URL ] = 'post'
        routes[ (BASE_URL + '/copy/12') ] = 'post'
        routes[ (BASE_URL + '/12') ] = 'put'
        routes[(BASE_URL + '/add/12/12') ] = 'put'
        routes[ (BASE_URL + '/remove/12/12') ] = 'put'
        routes[ (BASE_URL + '/bulk/12') ] = 'put'
        routes[ (BASE_URL + '/12') ] = 'delete'
        checkRoutesArePrivate(done, app, routes)
    })
})