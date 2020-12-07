import * as actions from './actionTypes'
import * as api from '../../shared/api_calls/lists'

// Functions for our list-related actions live here

// Start up the List retrieve processes
const listStart = () => {
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

// Get all lists for the current user in the database and place in Redux
export const listsGetAll = () => {
    return async dispatch => {
        // Start the list process
        dispatch(listStart())
        try {
            const response = await api.getAllLists()
            let firstList = null
            if (response.length > 0) {
                firstList = response[0]
            }
            dispatch(listsGetListsSuccess(response, firstList))
        } catch (error) {
            console.debug('Lists get all error:')
            console.debug(error)           
            // Clear out the old lists if we failed to get any
            dispatch(listClear())
            dispatch(listError(error))
        }
    }
}

// Create a new List and export it to our database, then
// putting this new list in Redux
export const listsCreateNewList = (name, isPublic) => {
    return async dispatch => {
        // Start the lists process
        dispatch(listStart())
        try {
            const response = await api.createNewList(name, isPublic)
            (process.env.NODE_ENV === 'development') && console.log('Create response:')
            (process.env.NODE_ENV === 'development') && console.log(response)
            dispatch(listsPostListSuccess(response))
        } catch (error) {
            // Failed to update the list for some reason
            dispatch(listError(error))
        }
    }
}

export const listsUpdateProblems = (updatedProblems, curListID) => {
    return async dispatch => {
        // Start the lists process
        dispatch(listStart())
        try {
            await api.updateListsProblems(updatedProblems, curListID)
            // Update the current list object to reflect the results
            dispatch(listsUpdatedProblemsSuccess())
        } catch (error) {
            dispatch(listError(error))
        }
    }
}