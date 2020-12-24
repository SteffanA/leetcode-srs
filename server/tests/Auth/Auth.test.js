const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
    ;
chai.use(chaiHttp);

const {checkForCorrectErrors, checkValidationResult} = require('../sharedTestFunctions.js')

const BASE_URL = '/api/auth'

describe('Auth API Tests' , () => {
    const testUser = 'authTester'
    const testEmail = 'authTester@test.com'
    const testPass = 'test12'
    // Create a user account we can test our authentication with.
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
                resolve(res)
            })
        })
    })

    describe('Test User Can Login', () => {
        // Checks for a successful user login response
        const checkSuccessfulLogin = (res, done) => {
            // Check response for a valid 200
            expect(res).to.have.status(200)
            // Check for the body to contain the expected fields
            const body = res.body
            expect(body).to.have.property('username')
            expect(body.username).to.equal(testUser)
            expect(body).to.have.property('token')
            expect(body).to.have.property('timeout')
            done()
        }

        it('Allows User to Auth With Name and Password', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                name: testUser,
                password: testPass,
            })
            .end((err, res) => {
                if (err) done(err)
                checkSuccessfulLogin(res, done)
            })
        })

        it('Allows User to Auth With Email and Password', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                email: testEmail,
                password: testPass,
            })
            .end((err, res) => {
                if (err) done(err)
                checkSuccessfulLogin(res, done)
            })
        })

        it('Allows User to Auth With Name, Email and Password', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                name: testUser,
                email: testEmail,
                password: testPass,
            })
            .end((err, res) => {
                if (err) done(err)
                checkSuccessfulLogin(res, done)
            })
        })
    })

    describe('Test Invalid Credentials Are Rejected', () => {
        // Check for the 400 response and invalid credentials message
        const checkInvalid = (res, done) => {
            checkForCorrectErrors(res, done, 400, 'Invalid credentials.')
        }

        it('Does not Allow User to Auth With Name and Invalid Password', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                name: testUser,
                password: 'invalid',
            })
            .end((err, res) => {
                if (err) done(err)
                checkInvalid(res, done)
            })
        })

        it('Does not Allow User to Auth With Email and Invalid Password', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                email: testEmail,
                password: 'invalid',
            })
            .end((err, res) => {
                if (err) done(err)
                checkInvalid(res, done)
            })
        })

        it('Does not Allow User to Auth With Invalid Name', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                name: 'invalidName',
                password: testPass,
            })
            .end((err, res) => {
                if (err) done(err)
                checkInvalid(res, done)
            })
        })

        it('Does not Allow User to Auth With Invalid Email', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                email: 'invalidEmail@test.com',
                password: testPass,
            })
            .end((err, res) => {
                if (err) done(err)
                checkInvalid(res, done)
            })
        })
    })

    describe('Test Auth Validation Checks are Successful', () => {

        it('Does not allow User to Auth With No Password', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                name: testUser,
            })
            .end((err, res) => {
                if (err) done(err)
                checkValidationResult(res, done, 'Password is required')
            })
        })

        it('Does not allow User to Auth With No Name or Email', (done) => {
            chai.request(app)
            .post(BASE_URL)
            .send({
                password: testPass,
            })
            .end((err, res) => {
                if (err) done(err)
                checkValidationResult(res, done, 'Name or Email must be provided')
            })
        })
    })
})