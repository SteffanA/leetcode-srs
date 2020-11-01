import axios from '../../axios-interceptor' //TODO: Revert to base axios
import {getTokenOrNull} from '../utility'

// Contains API calls that can be reused in various contexts for List objects

// Get all lists stored in our database for the current user
export const getAllLists = () => {
    // Get the user's token from local storage
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    else {
        // Get the user's lists
        const url = process.env.REACT_APP_HOST_URL + '/api/users/lists'
        const config = {
            headers: {
                'x-auth-token': token,
                'content-type': 'json',
            }
        }
        return new Promise((resolve, reject) => {
            axios.get(url, config).then(response => {
                if (!response) {
                    // No data returned.
                    reject('No lists available.')
                }
                else {
                    resolve(response.data)
                }
                
            }).catch(error => {
                console.debug(error)
                reject(error.msg)
            })
        })
    }
}

// Creates a new list with the given name and public status
export const createNewList = (name, isPublic) => {
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    const url = process.env.REACT_APP_HOST_URL + '/api/lists'
    const body = {
        "name": name,
        "public": isPublic.localeCompare('public') === 0 ? true : false,
    }

    const config = {
        headers: {
            'x-auth-token': token,
            'content-type': 'application/json',
        }
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

// Adds or removes problems from the given list
// updatedProblems must be an array in the following format:
/*
    [
        {
            "id" : problem_id,
            "add" : true to add to list, false to remove from list
        },
        <Repeat for all problems to update>
    ]
*/
export const updateListsProblems = (updatedProblems, curListID) => {
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    // Check if we have any problems to actually update
    if (updatedProblems === null || updatedProblems.length === 0) {
        // Exit early
        return 'No problems to update.'
    }
    const url = process.env.REACT_APP_HOST_URL + '/api/lists/bulk/' + curListID
    const config = {
        headers: {
            'x-auth-token': token,
            'content-type': 'application/json',
        }
    }
    const body = {
        "problems" : updatedProblems
    }

    return new Promise((resolve, reject) => {
        axios.put(url, body, config
        ).then(response => {
            console.log(response)
            resolve(response)
        }).catch(err => {
            console.debug(err)
            reject(err.message)
        })
    })
}