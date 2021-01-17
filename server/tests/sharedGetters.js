/*
Contains a variety of functions that can be used to get
certain objects as a part of a test
*/

const chai = require('chai')
const {expect} = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp);

// Returns a MongoDB ID that doesn't exist
// Tests can theoretically fail if the DB generates this string somehow
// NOTE: After looking at how IDs are generated, they are supposed to be
// unique across all MongoDB documents ever made - so this should be okay
const getFakeMongoDBid = () => {
    return '54edb381a13ec9142b9bb353'
}

// Returns a full public List object.
const getPublicList = (app, listId) => {
    return new Promise((resolve, reject) => {
        chai.request(app)
        .get('/api/lists/public/id/' + listId)
        .end((err, res) => {
            if (err) reject(err)
            expect(res).to.have.status(200)
            const body = res.body
            expect(body).to.have.property('name')
            expect(body).to.have.property('public')
            expect(body).to.have.property('problems')
            expect(body).to.have.property('_id')
            resolve(body)
        })
    })
}

// Return a full list object owned by a user
const getPrivateList = (app, listId, token) => {
    return new Promise((resolve, reject) => {
        chai.request(app)
        .get('/api/lists/private/' + listId)
        .set({'x-auth-token': token})
        .end((err, res) => {
            if (err) reject(err)
            expect(res).to.have.status(200)
            const body = res.body
            expect(body).to.have.property('name')
            expect(body).to.have.property('public')
            expect(body).to.have.property('problems')
            expect(body).to.have.property('_id')
            resolve(body)
        })
    })
}

// Get all lists owned a by a user
const getUsersLists = (app, token) => {
    return new Promise((resolve, reject) => {
        chai.request(app)
        .get('/api/lists/own')
        .set({'x-auth-token': token})
        .end((err, res) => {
            if (err) reject(err)
            expect(res).to.have.status(200)
            const body = res.body
            expect(body).to.be.an('array')
            resolve(body)
        })
    })
}

module.exports = {getFakeMongoDBid, getPublicList, getPrivateList, getUsersLists,
    }