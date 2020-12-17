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