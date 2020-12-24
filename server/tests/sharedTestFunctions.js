/*
Contains a variety of functions that can be used to test responses
*/

chai = require('chai'), chaiHttp = require('chai-http'),
expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

// Checks for a successful user register response
const checkSuccessfulLogin = (res, done, user) => {
    // Check response for a valid 200
    expect(res).to.have.status(200)
    // Check for the body to contain the expected fields
    const body = res.body
    expect(body).to.have.property('username')
    expect(body.username).to.equal(user)
    expect(body).to.have.property('token')
    expect(body).to.have.property('timeout')
    done()
}

// Check the response for the validation result we expect
const checkValidationResult = (res, done, msg) => {
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
    expect(errMsgs).to.contain(msg)
    done()
}

// Check for the correct error message in the error array returned
const checkForCorrectErrors = (res, done, err_code, err_msg) => {
    // Check response for a valid error code
    expect(res).to.have.status(err_code)
    // Check for the correct error message.
    expect(res.body).to.have.property('errors')
    expect(res.body.errors[0]).to.have.property('msg')
    expect(res.body.errors[0].msg).to.include(err_msg)
    done()
}

// Checks for the body to contain some 'msg'
const checkForCorrectMessage = (res, done, err_code, msg) => {
    // Check response 
    expect(res).to.have.status(err_code)
    expect(res.body).to.have.property('msg')
    expect(res.body.msg).to.include(msg)
    done()
}

// Check that the item removed isn't returned by the response
const checkForValidRemoval = (res, done, removedId) => {
    // Check response for a valid 200
    expect(res).to.have.status(200)
    let ids = []
    res.body.forEach((item) => {
        ids.push(item._id)
    })
    // Check that the removed ID isn't in the body
    expect(ids).to.not.include(removedId)
    done()
}

// Check that the item added is contained in the response
const checkForValidAddition = (res, done, addedId) => {
    // Check response for a valid 200
    expect(res).to.have.status(200)
    let ids = []
    res.body.forEach((item) => {
        ids.push(item._id)
    })
    expect(ids).to.contain(addedId)
    done()
}

module.exports = {checkForCorrectErrors, checkForValidAddition, checkForValidRemoval, 
    checkSuccessfulLogin, checkValidationResult, checkForCorrectMessage}