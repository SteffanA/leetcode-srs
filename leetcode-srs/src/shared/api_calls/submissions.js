import axios from '../../axios-interceptor' //TODO: Revert to base axios
import {getTokenOrNull} from '../utility'

// Contains API calls that can be reused in various contexts for List objects
const BASE_URL = process.env.REACT_APP_HOST_URL + '/api/submission/'


// Posts a new problem submission to the database for a particular problem
// Note it expects the LeetCode ID, not the MongoDB _id field!
export const addNewSubmission = (sub, prob_id) => {
    console.log('submitting')
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

    const body = {
        body: sub
    }
    return new Promise((resolve, reject) => {
        axios.post(url, body, config
        ).then(response => {
            resolve(response.data)
        }).catch(err => {
            console.debug(err)
            reject(err.message)
        })
    })
}