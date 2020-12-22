const { body } = require('express-validator');
const { deleteOne } = require('../../models/User');

const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const BASE_URL = '/api/users'

describe('User API Tests' , () => {

    describe('User Register Tests', () => {
        describe('Test User Can Register With Name and Pass', () => {
            it('Returns a 200 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name : 'test',
                    password: 'test12'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    done()
                })
            })
        })

        describe('Test User Can Register With Email and Pass', () => {
            it('Returns a 200 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test@test.com',
                    password: 'test12'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    done()
                })
            })
        })

        describe('Test User Cannot Register With no email or name, and with Pass', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    password: 'test12'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    done()
                })
            })
        })

        describe('Test User Cannot Register With Email or Name, and with no Pass', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name: 'test2'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    done()
                })
            })
        })

        describe('Test User Cannot Register With Duplicate Name', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name: 'test',
                    pass: 'test12'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    done()
                })
            })
        })

        describe('Test User Cannot Register With Duplicate Email', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test@test.com',
                    pass: 'test12'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    done()
                })
            })
        })

        // This test relies on the fact we already registered someone with a
        // name but no email earlier.
        describe('Test Multiple Users Can Register with Null Email', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    name: 'test3',
                    pass: 'test12'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    done()
                })
            })
        })

        // This test relies on the fact we already registered someone with an
        // email but no name earlier.
        describe('Test Multiple Users Can Register with Null Name', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test2@test.com',
                    pass: 'test12'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    done()
                })
            })
        })

        describe('Test Users Cannot Register with Pass under 6 chars', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .post(BASE_URL)
                .send({
                    email: 'test3@test.com',
                    pass: 'test'
                })
                .then((err, res) => {
                    if (err) done(err)
                    // Check response for a valid 400
                    expect(res).to.have.status(400)
                    // Check that the body throws the right error.
                    expect(body).to.have.property('errors')
                    done()
                })
            })
        })

        // describe('Test User Can Delete Self', () => {
        //     it('Returns a 200 response', () => {
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


    describe('User List Tests', () => {
    })

    describe('User Information Tests', () => {

        // Get an authentication token before the tests
        // let authUser = chai.request.agent(app)
        let token = ''

        describe('Test User Can Get Own Info', () => {
            before(() => {
                console.log('Running before...')
                // Send a request to the auth backend using the 
                // credentials for an account created
                // during the POST tests.
                return new Promise((resolve) => {
                    chai.request(app)
                    .post('/api/auth')
                    .send({
                        name : 'test',
                        password: 'test12'
                    })
                    .end((err, res) => {
                        console.log('Got responses')
                        if (err) {
                            console.log('error...')
                            console.log(err)
                            resolve(err)
                        }
                        token = res.body.token
                        console.log('token is....')
                        console.log(token)
                        resolve(res)
                    })
                })
            })

            it('Returns a 200 response with user\'s information', () => {
                chai.request(app)
                .get(BASE_URL)
                .set({'x-auth-token': token})
                .then((err, res, body) => {
                    if (err) done(err)
                    // Check response for a valid 200
                    expect(res).to.have.status(200)
                    expect(body).to.include.keys(['name', 'email', 'creationDate', 'lists', 'problem_statuses'])
                    done()
                })
            })
        })

    })


    describe('Protected Routes Require Auth Token', () => {
        describe('Test User Get Info Requires Auth', () => {
            it('Returns a 400 response', () => {
                chai.request(app)
                .get(BASE_URL)
                .then((err, res) => {
                    if (err) done(err)
                    // Check response 401 - no token in auth
                    expect(res).to.have.status(401)
                    done()
                })
            })
        })
    })

})