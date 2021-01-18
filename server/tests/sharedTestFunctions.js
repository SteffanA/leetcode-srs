/*
Contains a variety of functions that can be used to test responses
*/

const chai = require('chai')
const {expect} = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp);

// Create dummy function to pass instead of done to subroutine for cases
// where we execute the same check multiple times before returning
const dummyFunc = () => {}

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

// Checks a URL for multiple types of Validation Check results
// ReqBodies is an array of Objects that contains reqBody, being the body sent for the request,
// and err, containing the error message we expect to recieve
// ReqType is the string representation of the request - ex: put, get, post
// Token is optional for tests on APIs that require some kind of auth

// Example reqBodies below:
// reqs = [
//     {
//         reqBody: {name: '', public: false},
//         err: 'Lists must be named.'
//     },
// TODO: Refractor Problems, Auth, Users tests to utilize this function
const checkAllValidationResults = (app, reqType, url, reqBodies, token, done) => {

    // Validate we're supplying a correct reqBodies
    expect(reqBodies).to.be.an('array')
    for (let reqBody of reqBodies) {
        expect(reqBody).to.have.property('reqBody')
        // No type validation for reqBody, since can be object, array, etc
        expect(reqBody).to.have.property('err')
        expect(reqBody.err).to.be.a('string')
    }
    for (let reqBody of reqBodies) {
        chai.request(app)
        [`${reqType}`](url)
        // .put(BASE_URL)
        .set({'x-auth-token': token})
        .send(
            reqBody.reqBody
        )
        .end((err, res) => {
            if (err) done(err)
            checkValidationResult(res, dummyFunc, reqBody.err)
        })
    }
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
const checkForReturnedObject = (res, done, addedObj) => {
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
const checkForReturnedObjects = (res, resArrayName, done, addedObjArray) => {
    // Check response for a valid 200
    expect(res).to.have.status(200)
    const body = res.body
    let resArray = []
    if (resArrayName !== '') {
        expect(body[`${resArrayName}`]).to.be.an('array')
        resArray = body[`${resArrayName}`]
    }
    else {
        // No name provided, so assume the body itself is the res array
        expect(body).to.be.an('array')
        resArray = body
    }
    // If we have both an added object array length and a resArray length
    if (resArray.length > 0 && addedObjArray.length > 0) {
        // Expect each object in the response array to have the same keys
        const resKeys = Object.keys(resArray[0])
        // Likewise with added objects
        const addedKeys = Object.keys(addedObjArray[0])
        // Check that all of the addedKeys are in resKeys
        expect(resKeys).to.have.lengthOf.at.least(addedKeys.length)
        for (key of addedKeys) {
            expect(resKeys).to.contain(key)
        }
        const valueArrays = []
        // Create a new array to fill with values for each key we get in our response
        for (let i = 0; i < addedKeys.length; i++) {
            valueArrays.push([])
        }
        // Add all the key values for each object to its own array
        resArray.forEach((resObj) => {
            let i = 0
            for (key of addedKeys) {
                valueArrays[i].push(resObj[key])
                i++
            }
        })
        // Look for the added object's key's values in the valueArrays
        addedObjArray.forEach((addedObj) => {
            i = 0
            for (key of addedKeys) {
                expect(valueArrays[i]).to.contain(addedObj[key])
                i++
            }
        })
    } 
    // If the above statement isn't true, addedObjArray should have no values
    else {
        expect(addedObjArray).to.have.length(0)
    }
    done()
}

// Looks for a 200 response but empty array
const checkForEmptyArray = (res, resArrayName, done) => {
    // Check response for a valid 200
    expect(res).to.have.status(200)
    const body = res.body
    let resArray = []
    if (resArrayName !== '') {
        expect(body[`${resArrayName}`]).to.be.an('array')
        resArray = body[`${resArrayName}`]
    }
    else {
        // No name provided, so assume the body itself is the res array
        expect(body).to.be.an('array')
        resArray = body
    }
    expect(resArray).to.have.length(0)
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

// Check that the response contains all the IDs added, assuming IDs are passed
// back in Array of objects with an _id field as a part of the body
const checkForAddedIDsAsPartOfResObjects = (res, done, addedIds, resArrayName = '') => {
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
    const returnedIds = []
    for (let item of resArray) {
        expect(item).to.have.property('_id')
        returnedIds.push(item._id)
    }
    // Check that each added ID is in our response
    for (let addedId of addedIds) {
        expect(returnedIds).to.include(addedId)
    }
    done()
}

// Check that the response contains does not contain all the passed IDs , assuming IDs
// are passed back in Array of objects with an _id field as a part of the body
const checkIDsDoNotExistAsPartOfResObjects = (res, done, shouldntExistIds, resArrayName = '') => {
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
    const returnedIds = []
    for (let item of resArray) {
        expect(item).to.have.property('_id')
        returnedIds.push(item._id)
    }
    // Check that each added ID is in our response
    for (let dne of shouldntExistIds) {
        expect(returnedIds).to.not.include(dne)
    }
    done()
}

// Perform a GET request for an object to use as a baseline, then perform the request
// via the provided reqType and reqURL (ex: 'put' and '/api/lists/add/123'), and check
// the response array for an additional object or value compared to the baseline.
// Used for problem addition checks mainly, as we use a LeetCode ids for the request but get
// a MongoDB id in the response
// NOTE: Get functionality only tested against List routes for now, and expects a single response object
const checkForNewIdValueInResponseObject = (app, done, token, getURL, reqType, reqURL, resArrayName = '') => {
    let responseId = ''
    chai.request(app)
    .get(getURL)
    .set({'x-auth-token': token})
    .end((err, res) => {
        if (err) done(err)
        // Check we got a response and store the mongo ID
        expect(res).to.have.status(200)
        const body = res.body
        expect(body).to.have.property('_id')
        responseId = body._id
    })

    // Perform the request that should return a response containing the
    // responseId
    chai.request(app)
    [`${reqType}`](reqURL)
    .set({'x-auth-token': token})
    .end((err, res) => {
        if (err) done(err)
        expect(res).to.have.status(200)
        let resArray = res.body
        if (resArrayName !== '') {
            resArray = res.body[`${resArrayName}`]
        }
        // Now check for the responseID in the res array
        const ids = []
        for (let res of resArray) {
            expect(res).to.have.property('_id')
            ids.push(res._id)
        }
        expect(ids).to.include(responseId)
        done()
    })
}

// Perform a GET request for an object to use as a baseline, then perform the request
// via the provided reqType and reqURL (ex: 'put' and '/api/lists/remove/123'), and check
// the response array for the lack of the GET requested object.
// Used for problem addition checks mainly, as we use a LeetCode ids for the request but get
// a MongoDB id in the response
// NOTE: Get functionality only tested against List routes for now, and expects a single response object
const checkIdNotContainedInResArray = (app, done, token, getURL, reqType, reqURL, resArrayName = '') => {
    let responseId = ''
    chai.request(app)
    .get(getURL)
    .set({'x-auth-token': token})
    .end((err, res) => {
        if (err) done(err)
        // Check we got a response and store the mongo ID
        expect(res).to.have.status(200)
        const body = res.body
        expect(body).to.have.property('_id')
        responseId = body._id
    })

    // Perform the request that should return a response not containing the
    // responseId
    chai.request(app)
    [`${reqType}`](reqURL)
    .set({'x-auth-token': token})
    .end((err, res) => {
        if (err) done(err)
        // Expect a valid response and check that removed ID doesn't exist
        expect(res).to.have.status(200)
        let resArray = res.body
        if (resArrayName !== '') {
            resArray = res.body[`${resArrayName}`]
        }
        // Now check for the responseID in the res array
        const ids = []
        for (let res of resArray) {
            expect(res).to.have.property('_id')
            ids.push(res._id)
        }
        expect(ids).to.not.include(responseId)
        done()
    })

}

// Checks that a particular route requires authorization
// Token is defaulted to blank, but can be set to non-admin token
// to check admin-protected routes
const checkRouteIsPrivate = (done, app, route, routeType, token = '') => {
    chai.request(app)
    [`${routeType}`](route)
    .set({'x-auth-token': token})
    .end((err, res) => {
        if (err) done(err)
        checkForCorrectMessage(res, done, 401, 'No token provided. Authorization denied.')
    })
}

// Checks that all the given routes are private (require auth)
// Routes is an object of 1:1 mappings of string routes to string route type
// Ex: {'/api/problems' : 'get'}
// Token is defaulted to blank, but can be set to non-admin token in order
// to test admin-protected routes
const checkRoutesArePrivate = (done, app, routes, token = '') => {
    for (let route of Object.keys(routes)) {
        // This only works because each Object in the array has 1 key only
        const rType = routes[route]
        checkRouteIsPrivate(dummyFunc, app, route, rType, token)
    }
    done()
}

// Check if two Lists are the same in every way except for ID
const checkIfListsAreSame = (done, orig, copy) => {
    for (let prop of Object.keys(orig)) {
        // Skip these keys - ignore id and public, and handle problems after
        if (prop === '_id' || prop === 'problems' || prop === 'public') {
            continue
        }
        expect(orig.prop).to.be.equal(copy.prop)
    }
    const copyProbs = copy.problems.map((prob) => {
        expect(prob).to.have.property('_id')
        return prob._id
    })
    for (let prob of orig.problems) {
        expect(prob).to.have.property('_id')
        expect(copyProbs).to.include(prob._id)
    }
    done()
}

// Basic wait/sleep function
const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms)
    })
}

// Checks that a given problem status object contains required properties
const checkProblemStatusReturnedContainsProperties = (done, body) => {
    expect(body).to.have.property('results')
    expect(body).to.have.property('interval')
    expect(body).to.have.property('submissions')
    expect(body).to.have.property('next_submission')
    expect(body).to.have.property('problem')
    expect(body).to.have.property('_id')
    done()
}

// Checks that a given submission object contains required properties
// Note this only checks the required properites
const checkSubmissionReturnedContainsProperties = (done, body) => {
    expect(body).to.have.property('result')
    expect(body).to.have.property('time_spent')
    expect(body).to.have.property('submit_date')
    expect(body).to.have.property('_id')
    done()
}


module.exports = {checkForCorrectErrors, checkForValidAddition, checkForValidRemoval, 
    checkSuccessfulLogin, checkValidationResult, checkForCorrectMessage, checkForReturnedObject,
    checkForReturnedObjects, checkForAddedIDs, checkAllValidationResults, checkRouteIsPrivate,
    checkRoutesArePrivate,  checkForEmptyArray, checkForNewIdValueInResponseObject, 
    checkIdNotContainedInResArray,checkForAddedIDsAsPartOfResObjects, checkIDsDoNotExistAsPartOfResObjects,
    sleep, dummyFunc, checkIfListsAreSame, checkProblemStatusReturnedContainsProperties, 
    checkSubmissionReturnedContainsProperties, 
}