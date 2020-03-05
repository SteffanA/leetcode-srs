import * as actions from './actionTypes'
import axios from 'axios'

// Functions for our list-related actions live here
// TODO: What do we need?
/*
Get lists
update existing lists
create new lists

Should all be done in a reducer/action?
*/

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

const listsGetListsSuccess = (lists, firstList) => {
    return {
        type: actions.LISTS_RETRIEVE,
        lists: lists,
        firstList: firstList,
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
            //TODO: Adjust the api call when we edit the list server side code
            const url = process.env.REACT_APP_HOST_URL + '/api/lists/own'
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
                    const firstList = response.data[0]
                    dispatch(listsGetListsSuccess(response.data, firstList))
                }
                
            }).catch(error => {
                console.log(error)
                // TODO: When this works as intended, causes infinite loop. Need to determine why.
                // Infinite loop is of exclusively the LIST_ERROR call
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

// TODO: Add a clear lists thing to execute on logout