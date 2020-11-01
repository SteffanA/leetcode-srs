import * as actions from '../actions/actionTypes'
import { updateObject } from '../../shared/utility'

const initialState = {
    curList: null,
    curListName: null, // We could grab out of curList, but this is better perf (?)
    usersLists: null,
    error: null,
    loading: false,
}

// Start a list getting process
const listStart = (state, action) => {
    return updateObject(state, {error: null, loading: true})
}

// Set the current list (presumably to one of the ones in userLists)
const listSetCurrent = (state, action) => {
    return updateObject(state, {
        curList: action.curList,
        curListName: action.curList.name,
        loading: false,
    })
}

// Set the userLists (and the curList)
const listGetLists = (state, action) => {
    return updateObject(state, {
        curList: action.firstList,
        curListName: action.firstList.name,
        usersLists: action.lists,
        error: null,
        loading: false,
    })
}

// Update state to note we encounterd an error
const listError = (state, action) => {
    console.log(action)
    return updateObject(state, {error: action.error, loading: false})
}

// Clear out our state for lists
const listClear = (state, action) => {
    return updateObject(state, {
        curList: null,
        curListName: null,
        usersLists: null,
        error: null,
        loading: false,
    })
}

// Add a newly created list to our user's lists
// and make curList our newly added list
const listAddNewList = (state, action) => {
    return updateObject(state, {
        // Use the unified format of id and name
        curList: {
            id: action.list._id,
            name: action.list.name
        },
        curListName: action.list.name,
        // Update the array of user's lists
        usersLists: state.usersLists.push(action.list),
        error: null,
        loading: false,
    })
}

// Add or remove problems from a list
// For now, just reset loading and error
const listUpdateProblems = (state, action) => {
    return updateObject(state, {
        error: null,
        loading: false,
    })
}

export const listReducer = (state=initialState, action) => {
    switch (action.type) {
        case actions.LISTS_START: return listStart(state, action)
        case actions.LISTS_ERROR: return listError(state, action)
        case actions.LISTS_RETRIEVE: return listGetLists(state, action)
        case actions.LISTS_SET_CURRENT: return listSetCurrent(state, action)
        case actions.LISTS_CLEAR: return listClear(state, action)
        case actions.LISTS_ADD_NEW: return listAddNewList(state, action)
        case actions.LISTS_UPDATE_PROBLEMS: return listUpdateProblems(state, action)
        default: return state
    }
}