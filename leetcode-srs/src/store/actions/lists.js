import * as actions from './actionTypes'
import axios from '../../axios-interceptor' //TODO: Revert to base axios
// TODO: Setup env for debug usage of interceptor or base

// Functions for our list-related actions live here

// Start up the List retrieve processes
const listStart = () => {
    console.log('starting list process')
    return {
        type: actions.LISTS_START,
    }
}

// Mark our list action as having an error and store it
const listError = (error) => {
    return {
        type: actions.LISTS_ERROR,
        error: error,
    }
}

// Successfully retrieved lists from the backend
const listsGetListsSuccess = (lists, firstList) => {
    return {
        type: actions.LISTS_RETRIEVE,
        lists: lists,
        firstList: firstList,
        error: null,
    }
}

// Successfully added a new list
const listsPostListSuccess = (newList) => {
    return {
        type: actions.LISTS_ADD_NEW,
        list: newList,
        error: null,
    }
}

// Successfully updated the current list's problems
const listsUpdatedProblemsSuccess = () => {
    return {
        type: actions.LISTS_UPDATE_PROBLEMS,
        error: null,
    }
}

// BEGIN EXPORTS

export const listsGetAll = () => {
    return dispatch => {
        // Start the list process
        dispatch(listStart())
        // Get the user's token from local storage
        const token = localStorage.getItem('token')
        if (!token) {
            // If there's no token, we can't get lists
            dispatch(listError('User not logged in!'))
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
            axios.get(url, config).then(response => {
                if (!response) {
                    // No data returned.
                    dispatch(listError('No lists available.'))
                }
                else {
                    // So for all other calls where we update the cur list, we have it such that
                    // the object has id, not _id as a field.  We can take our response's first object
                    // and use that to set the cur list as a 'unified' format firstList
                    const unifiedFirstList = {
                        id: response.data[0]._id,
                        name: response.data[0].name
                    }
                    dispatch(listsGetListsSuccess(response.data, unifiedFirstList))
                }
                
            }).catch(error => {
                console.debug(error)
                // Clear out the old lists if we failed to get any
                dispatch(listClear())
                dispatch(listError(error.msg))
            })
        }
    }
}

// Update the current list
export const listSetCurrent = (list) => {
    return {
        type: actions.LISTS_SET_CURRENT,
        curList: list,
    }
}

// Clear out any information regarding lists
export const listClear = () => {
    return {
        type: actions.LISTS_CLEAR,
    }
}


// Create a new List and export it to our database
export const listsCreateNewList = (name, isPublic) => {
    return dispatch => {
        // Start the lists process
        dispatch(listStart())
        const token = localStorage.getItem('token')
        if (!token) {
            // If there's no token, we can't get lists
            dispatch(listError('User not logged in!'))
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

        axios.post(url, body, config
        ).then(response => {
            dispatch(listsPostListSuccess(response.data))
        }).catch(err => {
            console.debug(err)
            dispatch(listError(err.message)) 
        })
    }
}

export const listsUpdateProblems = (updatedProblems, curListID) => {
    return dispatch => {
        // Start the lists process
        dispatch(listStart())

        const token = localStorage.getItem('token')
        if (!token) {
            // If there's no token, we can't get lists
            dispatch(listError('User not logged in!'))
        }
        // Check if we have any problems to actually update
        if (updatedProblems === null || updatedProblems.length== 0) {
            // Exit early
            dispatch(listsUpdateProblems())
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
        axios.put(url, body, config
        ).then(response => {
            // Update the current list object to reflect the results
            console.log(response)
            dispatch(listsUpdateProblems())
        }).catch(err => {
            console.debug(err)
            dispatch(listError(err.message))
        })
    }
}