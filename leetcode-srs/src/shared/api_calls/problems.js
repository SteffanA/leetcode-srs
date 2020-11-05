import axios from '../../axios-interceptor' //TODO: Revert to base axios
import {getTokenOrNull} from '../utility'
// Contains API calls that can be reused in various contexts for List objects


// FOR ALL Problem GET FUNCTIONS:
// TODO: Make this only return, say problems 1-50. Add as var
// TODO: In future, exclude problems already part of current list
// (since this'll be used to show problems we can add to cur list)
// Could maybe add another optional param of how many results we want
// and from what index starting or something

// Update by bulk adding/removing problems from a given list
export const bulkUpdateProblems = (listID, updatedProblems) => {
    let error = null
    const token = getTokenOrNull()

    if (token === null) {
        // If there's no token, we can't get lists
        error = 'User not logged in!'
        return error
    }
    // Check if we have any problems to actually update
    if (updatedProblems === null || updatedProblems.length === 0) {
        // Exit early
        return 'No problems to update.'
    }
    const url = process.env.REACT_APP_HOST_URL + '/api/lists/bulk/' + listID
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
            // Update the current list object to reflect the results
            console.log(response)
            resolve(response)
        }).catch(err => {
            console.debug(err)
            reject(err.message)
        })
    })
}

// Get the problem's for a particular list.
export const getAllProblemsForList = (listID) => {
    if (!listID) {
        return 'No list provided.'
    }
    // Get the user's token from local storage
    const token = getTokenOrNull()
    if (token === null) {
        // If there's no token, we can't get problems
        return 'User not logged in!'
    }
    let url = process.env.REACT_APP_HOST_URL + '/api/lists/' + listID + '/problems'
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
                reject('No problems available.')
            }
            else {
                console.info('Successful get of all problems for list: ' + listID)
                console.info(response.data)
                resolve(response.data)
            }
        }).catch(error => {
            console.debug('getProblems error of' , error, ' from ', url)
            reject(error.msg)
        })
    })
}

// Get all problems that exist in our database
export const getAllProblems = () => {
    let url = process.env.REACT_APP_HOST_URL + '/api/problems/'
    const config = {
        headers: {
            'content-type': 'json',
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(url, config).then(response => {
            if (!response) {
                // No data returned.
                reject('No problems available.')
            }
            else {
                resolve(response.data)
            }
        }).catch(error => {
            console.debug('getProblems error of ' , error, ' from ', url)
            reject(error.msg)
        })
    })
}

// Get a subset of problems based on the problem number
// Start and end can be blank
export const getSubsetOfProblems = (start, end) => {
    let url = process.env.REACT_APP_HOST_URL + '/api/problems/?start=' + start + '&end=' + end
    const config = {
        headers: {
            'content-type': 'json',
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(url, config).then(response => {
            if (!response) {
                // No data returned.
                reject('No problems available.')
            }
            else {
                resolve(response.data)
            }
        }).catch(error => {
            console.debug('getProblems error of' , error, ' from ', url)
            reject(error.msg)
        })
    })
}

// Get all problems matching search results for a term
// Check server API for what fields are searched
// 10-31-2020 implementation is problem text and problem name
export const getProblemSearchResults = (term) => {
    let url = process.env.REACT_APP_HOST_URL + '/api/problems/name/' + term
    const config = {
        headers: {
            'content-type': 'json',
        }
    }
    console.info('Getting problem with url ' + url)
    return new Promise((resolve, reject) => {
        axios.get(url, config).then(response => {
            if (!response) {
                // No data returned.
                reject('No problems available.')
            }
            else {
                console.debug('Successfully got problems from search for term ' + term)
                resolve(response.data.problems)
            }
        }).catch(error => {
            console.debug('getProblems error of' , error, ' from ', url)
            reject(error.msg)
        })
    })
}