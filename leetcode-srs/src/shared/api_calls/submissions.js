import axios from '../../axios-interceptor' //TODO: Revert to base axios
import {getTokenOrNull} from '../utility'

// Contains API calls that can be reused in various contexts for List objects
const BASE_URL = process.env.REACT_APP_HOST_URL + '/api/submissions/'


// Posts a new problem submission to the database for a particular problem
// Note it expects the LeetCode ID, not the MongoDB _id field!
export const addNewSubmission = (sub, prob_id) => {
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }

    const url = BASE_URL + prob_id

    const config = {
        headers: {
            'x-auth-token': token,
            'content-type': 'application/json',
        }
    }

    // Cleanup the optional fields - remove them if blank strings
    // Don't need to do for text since a blank string is acceptable
    if (sub.mem_used === '') {
        delete sub.mem_used
    }
    if (sub.execution_time === '') {
        delete sub.execution_time
    }

    return new Promise((resolve, reject) => {
        axios.post(url, sub, config
        ).then(response => {
            resolve(response.data)
        }).catch(err => {
            console.debug('addNewSubmission error of' , err.response.data.errors, ' from ', url)
            reject(err.response.data.errors[0].msg)
        })
    })
}

// Get all submissions for a particular problem for a user based
// on the problem ID
export const getSubmissionsFromProblemID = (probID) => {
    const token = getTokenOrNull()
    // Submissions are linked to a user and require a token
    if (token === null) {
        return 'User not logged in!'
    }

    const url = BASE_URL + probID

    const config = {
        headers: {
            'x-auth-token': token,
            'content-type': 'application/json',
        }
    }

    return new Promise((resolve, reject) => {
        axios.get(url, config
        ).then(response => {
            resolve(response.data)
        }).catch(err => {
            console.debug('getSubFromProbId error of' , err.response.data.errors, ' from ', url)
            reject(err.response.data.errors[0].msg)
        })
    })
}