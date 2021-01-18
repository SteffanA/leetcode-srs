const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const {checkForCorrectErrors, 
    } = require('../sharedTestFunctions.js')

const {createTestUser, 
    } = require('../sharedCreationFunctions.js')

// Use the User API to test the Auth Middleware
const BASE_URL = '/api/users/lists'

describe('Auth Middleware Tests', () => {
    const testUser = 'auth'
    const testEmail = 'auth@test.com'
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

    it('Tests Can Validate Using Valid Auth Token', (done) => {
        chai.request(app)
        .get(BASE_URL)
        .set({'x-auth-token' : token})
        .end((err, res) => {
            if (err) done(err)
            // Just check that we managed to successfully access the API
            expect(res).to.have.status(200)
            done()
        })
    })

    it('Tests Cannot Validate When Not Provided Token', (done) => {
        chai.request(app)
        .get(BASE_URL)
        .set({'x-auth-token' : ''})
        .end((err, res) => {
            if (err) done(err)
            checkForCorrectErrors(res, done, 401, 'No token provided. Authorization denied.')
        })
    })

    it('Tests Cannot Validate With Incorrect Token', (done) => {
        chai.request(app)
        .get(BASE_URL)
        .set({'x-auth-token' : 1234321})
        .end((err, res) => {
            if (err) done(err)
            checkForCorrectErrors(res, done, 401, 'Invalid token. Authorization denied.')
        })
    })
})