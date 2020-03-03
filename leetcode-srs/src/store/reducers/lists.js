import * as actions from '../actions/actionTypes'
import {updateObject} from '../../utility/utility'

const initialState = {
    curList: null,
    usersLists: null,
    error: null,
    loading: false,
}
//TODO: Need to maybe update state or split this reducer when doing
// more than just getting lists

// Start a list getting process
const listStart = (state, action) => {
    return updateObject(state, {error: null, loading: true})
}

// Set the current list (presumably to one of the ones in userLists)
const listSetCurrent = (state, action) => {
    return updateObject(state, {
        curList: action.selectedList
    })
}

// Set the userLists (and the curList)
const listGetLists = (state, action) => {
    return updateObject(state, {
        curList: action.firstList,
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

const reducer = (state=initialState, action) => {
    switch (action.type) {
        case actions.LIST_START: return listStart(state, action)
        case actions.LIST_ERROR: return listError(state, action)
        case actions.LIST_RETRIEVE: return listGetLists(state, action)
        case actions.LIST_SET_CURRENT: return listSetCurrent(state, action)
        default: return state
    }
}

export default reducer