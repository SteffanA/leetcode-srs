const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
chai.use(chaiHttp);

const fs = require('fs'); // For reading local JSON file

const {checkForCorrectErrors, checkAllValidationResults, 
        checkSubmissionReturnedContainsProperties,
        dummyFunc,
    } = require('../sharedTestFunctions.js')

const {createTestUser, convertLeetCodeResToOurObjects,
        createOrGetTokenForAdminUser, addProblemStatus,
        addProblemsToDatabase,
    } = require('../sharedCreationFunctions.js')

const {getProbIdFromLCid, getFakeMongoDBid, 
    } = require('../sharedGetters.js');
const { addDays } = require('../../utility/utility');

const BASE_URL = '/api/submissions'
// Note that the test is run at the root of the server module,
// and thus the path is defined as if we are at the root of the server folder
const TEST_PROBLEMS_PATH = './tests/Submissions/submissionsTestProblems.json'
