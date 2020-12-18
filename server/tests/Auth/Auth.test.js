const app = require('../../server'),
    chai = require('chai'), chaiHttp = require('chai-http'),
    expect = chai.expect //to solve error when using done(): “ReferenceError: expect is not defined”
    ;
chai.use(chaiHttp);

const BASE_URL = 'api/auth'