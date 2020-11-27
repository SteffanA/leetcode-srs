import axios from '../../axios-interceptor' //TODO: Revert to base axios
import {getTokenOrNull} from '../utility'

// Contains API calls that can be reused in various contexts for List objects

const base_url = process.env.REACT_APP_HOST_URL + '/api/lists'

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
        // Note this URL is actually on the User's API
        // TODO: Does this make sense to move?
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
        axios.post(base_url, body, config
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
    if (!curListID) {
        console.error('Cur listID undefined!')
        return 'No curListID provided.'
    }
    const url = base_url + '/bulk/' + curListID
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

// Set's a list's public status to True
// TODO: Why does this not work when given the name setListPublic ?
export const setPublic = async (listID) => {
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    const url = base_url + '/' + listID
    const config = {
        headers: {
            'x-auth-token': token,
            'content-type': 'application/json',
        }
    }
    const body = {
        "public" : true,
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

// Search all public lists by name
export const searchPublicLists = async (term) => {
    const url = base_url + '/public/search/' + term
    const config = {
        headers: {
            'content-type': 'application/json',
        }
    }

    return new Promise((resolve, reject) => {
        axios.get(url, config).then(
            response => {
                console.log(response)
                resolve(response.data)
            }
        ).catch(err => {
            console.debug(err)
            reject(err.message)
        })
    })
}

// Get all existing public lists
export const getPublicLists = async () => {
    const config = {
        headers: {
            'content-type': 'application/json',
        }
    }

    return new Promise((resolve, reject) => {
        axios.get(base_url, config).then(
            response => {
                console.log(response)
                resolve(response.data)
            }
        ).catch(err => {
            console.debug(err)
            reject(err.message)
        })
    })
}


// Clone a public list as a new private list for the user
export const clonePublicList = async (listID) => {
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    const url = base_url + '/copy/' + listID
    const config = {
        headers: {
            'content-type': 'application/json',
            'x-auth-token': token,
        }
    }

    return new Promise((resolve, reject) => {
        axios.post(url, null, config).then(
            response => {
                console.log(response)
                resolve(response.data)
            }
        ).catch(err => {
            console.debug(err)
            reject(err.message)
        })
    })
}

// Deletes a private list that logged in user owns
export const deletePrivateList = async (listID) => {
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    const url = base_url + '/' + listID
    const config = {
        headers: {
            'content-type': 'application/json',
            'x-auth-token': token,
        }
    }

    return new Promise((resolve, reject) => {
        axios.delete(url, config).then(
            response => {
                console.log(response)
                resolve(response.data)
            }
        ).catch(err => {
            console.debug(err)
            reject(err.message)
        })
    })
}

// Renames a private list that logged in user owns
export const renamePrivateList = async (listID, newName) => {
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    const url = base_url + '/' + listID
    const config = {
        headers: {
            'x-auth-token': token,
            'content-type': 'application/json',
        }
    }
    const body = {
        "name" : newName,
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