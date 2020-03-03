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
export const listStart = () => {
    return {
        type: actions.LIST_START,
    }
}

// Mark our list action as having an error and store it
export const listError = (error) => {
    return {
        type: actions.LIST_ERROR,
        error: error,
    }
}

export const listGetListsSuccess = (lists, firstList) => {
    return {
        type: actions.LIST_RETRIEVE,
        lists: lists,
        firstList: firstList,
        error: null,
    }
}


export const listGetAll = () => {
    return dispatch => {
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
                    dispatch(listGetListsSuccess(response.data, firstList))
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

export const listSetCurrent = (list) => {
    return {
        type: actions.LIST_SET_CURRENT,
        curList: list,
    }
}