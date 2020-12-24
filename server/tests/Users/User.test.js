const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const BASE_URL = '/api/users'

describe('User API Tests' , () => {

    // Token for all tests that use a same registered user
    let token = ''
    // Token for a user that is different from the common registered user
    let otherUserToken = ''
    // List ID for a list belonging to the 'token' user
    let listID = ''
    // List ID for a private list belonging to 'otherUserToken' user
    let privateListID = ''

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
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    const body = res.body
                    const errs = []
                    const errMsgs = []
                    body.errors.forEach((error) => {
                        errs.push(error)
                        expect(error).to.have.property('msg')
                        errMsgs.push(error.msg)
                    })
                    expect(errMsgs).to.contain('Name is required.')
                    done()
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
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    const body = res.body
                    const errs = []
                    const errMsgs = []
                    body.errors.forEach((error) => {
                        errs.push(error)
                        expect(error).to.have.property('msg')
                        errMsgs.push(error.msg)
                    })
                    expect(errMsgs).to.contain('Please enter a password with at least 6 characters.')
                    done()
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
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    const body = res.body
                    expect(body).to.have.property('errors')
                    const errs = []
                    const errMsgs = []
                    body.errors.forEach((error) => {
                        errs.push(error)
                        expect(error).to.have.property('msg')
                        errMsgs.push(error.msg)
                    })
                    expect(errMsgs).to.contain('Name is required.')
                    done()
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
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    // Check that the body throws the right error.
                    const body = res.body
                    const errs = []
                    const errMsgs = []
                    body.errors.forEach((error) => {
                        errs.push(error)
                        expect(error).to.have.property('msg')
                        errMsgs.push(error.msg)
                    })
                    expect(errMsgs).to.contain('Please enter a password with at least 6 characters.')
                    done()
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
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('username')
                    expect(body.username).to.equal('test')
                    expect(body).to.have.property('token')
                    // Set otherUserToken for use later
                    otherUserToken = body.token
                    expect(body).to.have.property('timeout')
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
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('username')
                    expect(body.username).to.equal('tester')
                    expect(body).to.have.property('token')
                    expect(body).to.have.property('timeout')
                    done()
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
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    const body = res.body
                    const errs = []
                    const errMsgs = []
                    body.errors.forEach((error) => {
                        errs.push(error)
                        expect(error).to.have.property('msg')
                        errMsgs.push(error.msg)
                    })
                    expect(errMsgs).to.contain('User already exists for this name')
                    done()
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
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    const body = res.body
                    const errs = []
                    const errMsgs = []
                    body.errors.forEach((error) => {
                        errs.push(error)
                        expect(error).to.have.property('msg')
                        errMsgs.push(error.msg)
                    })
                    expect(errMsgs).to.contain('User already exists for this email')
                    done()
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
                    // Check response for a valid 200
                    console.log(res.body)
                    expect(res).to.have.status(200)
                    const body = res.body
                    expect(body).to.have.property('username')
                    expect(body.username).to.equal('test3')
                    expect(body).to.have.property('token')
                    expect(body).to.have.property('timeout')
                    done()
                })
            })
        })

        // describe('Test User Can Delete Self', () => {
        //     it('Returns a 200 response', (done) => {
        //         chai.request(app)
        //         .post(BASE_URL)
        //         .end((err, res) => {
        //             if (err) done(err)
        //             // Check response for a valid 200
        //             expect(res).to.have.status(200)
        //             done()
        //         })
        //     })
        // })
    })



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
                        console.log('token is: ' + token)
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
                        console.log('List id being set to...')
                        listID = res.body._id
                        console.log(listID)
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
                        console.log('Private list id being set to...')
                        privateListID = res.body._id
                        console.log(privateListID)
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
                // Check response for a valid 200
                expect(res).to.have.status(200)
                let listIds = []
                res.body.forEach((list) => {
                    listIds.push(list._id)
                })
                // Check that the added list isn't in the body
                expect(listIds).to.not.include(listID)
                done()
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
                // Check response for a valid 404
                expect(res).to.have.status(404)
                // Check for the correct error message.
                expect(res.body).to.have.property('errors')
                expect(res.body.errors[0]).to.have.property('msg')
                expect(res.body.errors[0].msg).to.include('List not a part of user\'s Lists.')
                done()
            })
        })

        it('Returns 404 When Removing List Without Providing a Valid List', (done) => {
            chai.request(app)
            .put(BASE_URL + '/remove/1')
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                // Check response for a valid 404
                expect(res).to.have.status(404)
                // Check for the correct error message
                expect(res.body).to.have.property('errors')
                expect(res.body.errors[0]).to.have.property('msg')
                expect(res.body.errors[0].msg).to.include('List not found.')
                done()
            })
        })

        it('Returns 200 and Returns Lists with Added List', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/' + listID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                // Check response for a valid 200
                expect(res).to.have.status(200)
                let listIds = []
                res.body.forEach((list) => {
                    listIds.push(list._id)
                })
                expect(listIds).to.contain(listID)
                done()
            })
        })

        it('Returns 409 and Returns Error when Adding Same List Twice', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/' + listID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                // Check response for a valid 409
                expect(res).to.have.status(409)
                expect(res.body).to.have.property('errors')
                expect(res.body.errors[0]).to.have.property('msg')
                expect(res.body.errors[0].msg).to.include('List already in User\'s lists.')
                done()
            })
        })

        it('Returns 404 and Returns Error When Adding List with Invalid ID', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/1')
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                // Check response for a valid 404
                expect(res).to.have.status(404)
                expect(res.body).to.have.property('errors')
                expect(res.body.errors[0]).to.have.property('msg')
                expect(res.body.errors[0].msg).to.include('List not found.')
                done()
            })
        })

        it('Returns 404 and Returns Error When Adding List with that is Private that other User owns', (done) => {
            chai.request(app)
            .put(BASE_URL + '/add/' + privateListID)
            .set({'x-auth-token': token})
            .end((err, res) => {
                if (err) done(err)
                // Check response for a valid 404
                expect(res).to.have.status(404)
                expect(res.body).to.have.property('errors')
                expect(res.body.errors[0]).to.have.property('msg')
                expect(res.body.errors[0].msg).to.include('List not found.')
                done()
            })
        })
    })

    // Tests that assure that we are correctly using our auth middleware for
    // the routes we expect to be auth-protected
    describe('Protected Routes Require Auth Token', () => {
        describe('Test User Get Info Requires Auth', () => {
            it('Returns a 401 response and warns of no token', (done) => {
                chai.request(app)
                .get(BASE_URL)
                .end((err, res) => {
                    if (err) done(err)
                    // Check response 401 - no token in auth
                    expect(res).to.have.status(401)
                    expect(res.body).to.have.property('msg')
                    expect(res.body.msg).to.include('No token provided. Authorization denied.')
                    done()
                })
            })
        })

        describe('Test User Get Lists Requires Auth', () => {
            it('Returns a 401 response and warns of no token', (done) => {
                chai.request(app)
                .get(BASE_URL + '/lists')
                .end((err, res) => {
                    if (err) done(err)
                    // Check response 401 - no token in auth
                    expect(res).to.have.status(401)
                    expect(res.body).to.have.property('msg')
                    expect(res.body.msg).to.include('No token provided. Authorization denied.')
                    done()
                })
            })
        })

        describe('Test User Add List Requires Auth', () => {
            it('Returns a 401 response and warns of no token', (done) => {
                chai.request(app)
                .put(BASE_URL + '/add/1234')
                .end((err, res) => {
                    if (err) done(err)
                    // Check response 401 - no token in auth
                    expect(res).to.have.status(401)
                    expect(res.body).to.have.property('msg')
                    expect(res.body.msg).to.include('No token provided. Authorization denied.')
                    done()
                })
            })
        })

        describe('Test User Remove List Requires Auth', () => {
            it('Returns a 401 response and warns of no token', (done) => {
                chai.request(app)
                .put(BASE_URL + '/remove/1234')
                .end((err, res) => {
                    if (err) done(err)
                    // Check response 401 - no token in auth
                    expect(res).to.have.status(401)
                    expect(res.body).to.have.property('msg')
                    expect(res.body.msg).to.include('No token provided. Authorization denied.')
                    done()
                })
            })
        })

        describe('Test User Deletion Requires Auth', () => {
            it('Returns a 401 response and warns of no token', (done) => {
                chai.request(app)
                .delete(BASE_URL)
                .end((err, res) => {
                    if (err) done(err)
                    // Check response 401 - no token in auth
                    expect(res).to.have.status(401)
                    expect(res.body).to.have.property('msg')
                    expect(res.body.msg).to.include('No token provided. Authorization denied.')
                    done()
                })
            })
        })
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