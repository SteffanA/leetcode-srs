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
                    name: 'test2@test.com',
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
    })

})