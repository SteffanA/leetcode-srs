const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const {checkForCorrectErrors, checkForValidAddition,
        checkForValidRemoval, checkSuccessfulLogin,
        checkValidationResult, checkRoutesArePrivate} = require('../sharedTestFunctions.js')

const BASE_URL = '/api/users'

// TODO: Refractor this to utilize new test functions
describe('User API Tests' , () => {

    // Token for all tests that use a same registered user
    let token = ''
    // Token for a user that is different from the common registered user
    let otherUserToken = ''
    // List ID for a list belonging to the 'token' user
    let listID = ''
    // List ID for a private list belonging to 'otherUserToken' user
    let privateListID = ''
    
    // Tests to ensure we can register a user
    describe('User Register Tests', () => {
        describe('Test User Register Validation Checks', () => {

            it('Does not allow User to Register with no Name or Email', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    password: 'test12'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Name is required.')
                })
            })

            it('Does not allow User to Register with No Password', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name: 'test2'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Please enter a password with at least 6 characters.')
                })
            })

            it('Does not allow User to Register with no Name but with Email', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test4@test4.com',
                    password: 'test12'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Name is required.')
                })
            })

            it('Does not allow User to Register with Password under 6 characters', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test3@test.com',
                    password: 'test'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'Please enter a password with at least 6 characters.')
                })
            })
        })


        describe('Test User Can Register With Name and Pass', () => {
            it('Returns a 200 response', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name : 'test',
                    password: 'test12'
                })
                .end((err, res) => {
                    if (err) done(err)
                    // Use a dummy function to pass for 'done' to our register
                    // test so we retain access to set the otherUserToken
                    const dummyFunc = () => {}
                    checkSuccessfulLogin(res, dummyFunc, 'test')
                    const body = res.body
                    // Set otherUserToken for use later
                    otherUserToken = body.token
                    done()
                })
            })
        })

        describe('Test User Can Register With Email, Name and Pass', () => {
            it('Returns a 200 response', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test@test.com',
                    name: 'tester',
                    password: 'test12'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkSuccessfulLogin(res, done, 'tester')
                })
            })
        })

        describe('Test User Cannot Register With Duplicate Name', () => {
            it('Returns a 400 response', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name: 'test',
                    password: 'test12'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'User already exists for this name')
                })
            })
        })

        describe('Test User Cannot Register With Duplicate Email', () => {
            it('Returns a 400 response', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test@test.com',
                    name: 'dupeEmailTest',
                    password: 'test12'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkValidationResult(res, done, 'User already exists for this email')
                })
            })
        })

        // This test relies on the fact we already registered someone with a
        // name but no email earlier.
        describe('Test Multiple Users Can Register with Null Email', () => {
            it('Returns a 200 response', (done) => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name: 'test3',
                    password: 'test12'
                })
                .end((err, res) => {
                    if (err) done(err)
                    checkSuccessfulLogin(res, done, 'test3')
                })
            })
        })
    })


    // Tests to check if we can get a User's information
    describe('User Information Tests', () => {

        // Get an authentication token before the tests
        before(() => {
            // Register a user to use for info tests
            return new Promise((resolve) => {

                // Create a test user
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name: 'userTest',
                    password: 'userTest'
                })
                .end((err, res) => {
                    if (err) {
                        console.log('Could not finish User before - failed to create user')
                        resolve(err)
                    }
                    else {
                        token = res.body.token
                        resolve(res)
                    }
                }) //end create user
            }) // Finish promise
        })

        // Create a new list for the user.
        before(() => {
            return new Promise((resolve) => {
                // Create a new list for the user
                chai.request(app)
                .post('/api/lists')
                .set({'x-auth-token': token})
                .send({
                    name: 'userTestList',
                    public: false,
                })
                .end((err, res) => {
                    if (err) {
                        console.log('Could not finish User before - failed to create list.')
                        resolve(err)
                    }
                    else {
                        // Retrieve the list ID from the res
                        listID = res.body._id
                        resolve(res)
                    }
                }) // end create list
            }) // Finish promise
        })

        describe('Test User Can Get Own Info', () => {

            it('Returns a 200 response with user\'s information', (done) => {
                chai.request(app)
                .get(BASE_URL)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    expect(res.body).to.include.keys(['name', 'email', 'creationDate', 'lists', 'problem_statuses'])
                    done()
                })
            })

            it('Returns a 200 response with user\'s lists', (done) => {
                chai.request(app)
                .get(BASE_URL + '/lists')
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    expect(res.body[0]._id).to.include(listID)
                    done()
                })
            })
        })

    })


    // Tests to do with adding/removing lists from a User
    describe('User List Tests', () => {
        before(() => {
            // Create a list with another user to test private checks work
            return new Promise((resolve) => {
                // Create a new list for the user
                chai.request(app)
                .post('/api/lists')
                .set({'x-auth-token': otherUserToken})
                .send({
                    name: 'otherUserTestList',
                    public: false,
                })
                .end((err, res) => {
                    if (err) {
                        console.log('Could not finish other User before - failed to create private list.')
                        resolve(err)
                    }
                    else {
                        // Retrieve the list ID from the res
                        privateListID = res.body._id
                        resolve(res)
                    }
                }) // end create list
            }) // Finish promise
        })

        it('Returns 200 When Removing List that Exists', (done) => {
            chai.request(app)
            .put(BASE_URL + '/remove/' + listID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForValidRemoval(res, done, listID)
            })
        })

        it('Returns 404 When Removing List that Doesn\'t Exist In Users Lists', (done) => {
            chai.request(app)
            .put(BASE_URL + '/remove/' + listID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) {
                    console.log('We erred for not exist')
                    done(err)
                }
                checkForCorrectErrors(res, done, 404, 'List not a part of user\'s Lists.')
            })
        })

        it('Returns 404 When Removing List Without Providing a Valid List', (done) => {
            chai.request(app)
            .put(BASE_URL + '/remove/1')
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        it('Returns 200 and Returns Lists with Added List', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/' + listID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForValidAddition(res, done, listID)
            })
        })

        it('Returns 409 and Returns Error when Adding Same List Twice', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/' + listID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 409, 'List already in User\'s lists.')
            })
        })

        it('Returns 404 and Returns Error When Adding List with Invalid ID', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/1')
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })

        it('Returns 404 and Returns Error When Adding List with that is Private that other User owns', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/' + privateListID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                checkForCorrectErrors(res, done, 404, 'List not found.')
            })
        })
    })


    // Tests that assure that we are correctly using our auth middleware for
    // the routes we expect to be auth-protected
    it('Tests Private Routes Require Authorization', (done) => {

        const routes = {}
        routes[ BASE_URL] = 'get'
        routes[ (BASE_URL + '/lists') ] = 'get'
        routes[ (BASE_URL + '/add/12') ] = 'put'
        routes[ (BASE_URL + '/remove/12') ] = 'put'
        routes[ BASE_URL ] = 'delete'
        checkRoutesArePrivate(done, app, routes)
    })


    describe('User Deletion Tests', () => {
            it('Returns a 200 response with True Response', (done) => {
                chai.request(app)
                .delete(BASE_URL)
                .set({'x-auth-token': token})
                .end((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    expect(res.body).to.equal(true)
                    done()
                })
            })
    })

})