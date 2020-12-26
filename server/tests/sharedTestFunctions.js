/*
Contains a variety of functions that can be used to test responses
*/

const chai = require('chai')
const {expect} = require('chai')
const chaiHttp = require('chai-http')
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

// Checks the response contains the provided object
// Intended for use against a single response object, not an array of response objects
const checkForAddedObject = (res, done, addedObj) => {
    // Check response for a valid 200
    expect(res).to.have.status(200)
    const body = res.body
    expect(body).to.be.an('object')
    // Check that each key in the response corresponds to the provided object
    const obj_keys = Object.keys(addedObj)
    body_vals = Object.values(body)
    obj_keys.forEach((key) => {
        object_val = addedObj[key]
        expect(body_vals).to.include(object_val)
    })
    done()
}

// Checks that each object provided is contained in the response array
// Assumes each object in the resArray follows the same key-value format
// TODO: This hasn't been fully tested - no current use
const checkForAddedObjects = (res, resArrayName, done, addedObjArray) => {
    // Check response for a valid 200
    console.log(res.body)
    expect(res).to.have.status(200)
    const body = res.body
    console.log('body')
    console.log(body)
    expect(body[`${resArrayName}`]).to.be.an('array')
    const resArray = body[`${resArrayName}`]
    console.log('resArray')
    console.log(resArray)
    // If we have both an added object array length and a resArray length
    if (resArray.length > 0 && addedObjArray.length > 0) {
        const resKeys = Object.keys(resArray[0])
        const addedKeys = Object.keys(addedObjArray[0])
        // Check that all of the addedKeys are in resKeys
        expect(resKeys).to.have.lengthOf.at.least(addedKeys.length)
        for (key of addedKeys) {
            expect(resKeys).to.contain(key)
        }
        const valueArrays = new Array(resKeys.length)
        // Add all the key values for each object to its own array
        resArray.forEach((resObj) => {
            let i = 0
            for (key of resKeys) {
                valueArrays[i].push(resObj[key])
                i++
            }
        })
        // Look for the added object's key's values in the valueArrays
        addedObjArray.forEach((addedObj) => {
            i = 0
            for (key of resKeys) {
                expect(valueArrays[i]).to.contain(addedObj[key])
            }
        })
    } 
    // If the above statement isn't true, addedObjArray should have no values
    else {
        expect(addedObjArray).to.have.length(0)
    }
    done()
}

// Check that the response contains all the IDs added, assuming IDs are passed
// back in Array as a part of the body
const checkForAddedIDs = (res, done, addedIds, resArrayName = '') => {
    // Check response for a valid 200
    expect(res).to.have.status(200)
    const body = res.body
    let resArray = []
    // If passed name, resArray is a member of the body
    if (resArrayName.length > 0) {
        expect(body[`${resArrayName}`]).to.be.an('array')
        resArray = body[`${resArrayName}`]
    }
    // Otherwise resArray is the body itself
    else {
        expect(body).to.be.an('array')
        resArray = body
    }
    // Check that each added ID is in our response
    for (let addedId of addedIds) {
        expect(resArray).to.include(addedId)
    }
    done()
}

module.exports = {checkForCorrectErrors, checkForValidAddition, checkForValidRemoval, 
    checkSuccessfulLogin, checkValidationResult, checkForCorrectMessage, checkForAddedObject,
    checkForAddedObjects, checkForAddedIDs
}