import * as actionTypes from '../actions/actionTypes'
import { updateObject } from '../../shared/utility'

const intialState = {
    token: null, // User's auth token
    userId: null, // User's ID
    error: null, // Auth error
    loading: false, // Loading auth result
}

// Start authentication process - reset error & set loading
const authStart = (state, action) => {
    return updateObject(state, {error: null, loading: true})
}

// Successful authentication action - reset error & loading
// Update token and ID information
const authSuccess = (state, action) => {
    console.log('auth successful. token set to ', action.token)
    return updateObject(state, {
        error: null,
        loading: true,
        token: action.token,
        userId: action.userId,
    })
}

// Failed auth - update error and set loading false
const authFail = (state, action) => {
    return updateObject(state, {
        error: action.error,
        loading: false,
    })
}

// Logout - reset the user ID and their token
const authLogout = (state, action) => {
    return updateObject(state, {
        token: null,
        userId: null,
    })
}

const reducer = (state=intialState, action) => {
    switch(action.type) {
        case actionTypes.AUTH_START: return authStart(state, action) 
        case actionTypes.AUTH_FAIL: return authFail(state, action)
        case actionTypes.AUTH_SUCCESS: return authSuccess(state, action)
        case actionTypes.AUTH_LOGOUT: return authLogout(state, action)
        default: return state
    }
}

export default reducer