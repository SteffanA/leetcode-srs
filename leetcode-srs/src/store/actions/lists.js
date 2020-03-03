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
            let url = process.env.REACT_APP_HOST_URL + '/api/lists/own'
            axios.get(url).then(response => {
                if (!response) {
                    // No data returned.
                    dispatch(listError('No lists available.'))
                }
                else {
                    firstList = response.data[0]._id
                    dispatch(listGetListsSuccess(response.data, firstList))
                }
                
            }).catch(error => {
                console.log(error)
                dispatch(listError(error.msg))
            })
        }
    }
    
}

export const listSetCurrent = (listId) => {
    return {
        type: actions.LIST_SET_CURRENT,
        curList: listId,
    }
}