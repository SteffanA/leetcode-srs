import axios from '../../axios-interceptor' //TODO: Revert to base axios
import {getTokenOrNull} from '../utility'

const BASE_URL = process.env.REACT_APP_HOST_URL + '/api/problem_status/'

export const getProblemToNextSubTime = async (problems) => {
    // Get the user's token from local storage
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    else {
        let url = BASE_URL + 'next_times'
        const config = {
            headers: {
                'x-auth-token': token,
                'content-type': 'application/json',
            }
        }

        const body = {
            "problems" : problems
        }

        return new Promise((resolve, reject) => {
            axios.put(url, body, config).then(response => {
                resolve(response.data)
            }).catch(error => {
                console.debug('Get next sub times error of ' , error, ' from bulk problems')
                reject(error.msg)
            })
        })
    }
}