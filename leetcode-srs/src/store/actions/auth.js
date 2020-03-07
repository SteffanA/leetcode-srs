import * as actionTypes from './actionTypes'
import axios from 'axios'
import { problemsClear } from './problems'
import { listClear } from './lists'

// Functions for our auth actions are here

// Signal to reducer that auth has started
const authStart = () => {
    return {
        type: actionTypes.AUTH_START,
    }
}

// Send success action and payload to reducer
const authSuccess = (token, name) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        userId: name,
    }
}

// Logout our user when token expires
const checkAuthTimeout = (expiresIn) => {
    return dispatch => {
        console.log('Expires in: ' + expiresIn)
        // TODO: Is this even required...? Seems to handle expired token okay
        // Un-commenting it breaks autologin; need to understand why
        // setTimeout(() => {
        //     dispatch(logout())
        // }, expiresIn*1000)
    }
}

// Handle user logout & signal reducer
const logout = () => {
    return {
        type: actionTypes.AUTH_LOGOUT,
    }
}

// Signal to our reducer that auth has failed
const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error,
    }
}

export const checkAuthState = () => {
    return dispatch => {
        // Check if we have a stored token
        const token = localStorage.getItem('token')
        if (!token) {
            console.log('No token logout')
            // Logout if no token; no effect if not logged in
            dispatch(logoutHandler())
        }
        else {
            // We have a token stored; check if it's still valid
            // TODO: This is all definitely wrong now; we need to fix.
            const expirationDate = Date.now()+(localStorage.getItem('expirationDate')*1000)
            console.log('expire data ', expirationDate)
            // Check if token has already expired
            if (expirationDate > new Date()) {
                // Still valid, let's login with it
                const name = localStorage.getItem('userId')
                // Mark us successfully logged in
               dispatch(authSuccess(token, name))
               // Start our auth timeout timer
               dispatch(checkAuthTimeout(expirationDate - Date.now()))
            }
            else {
                // Expired
                console.log('Expired token, logging out.')
                dispatch(logoutHandler())
            }
        }
    }   
}

export const auth = (email, password, isRegister, name='') => {
    return dispatch => {
        // Start the auth process
        dispatch(authStart())

        const authData = {
            email: email,
            password: password,
        }
        let url = process.env.REACT_APP_HOST_URL + '/api/'
        // Change API endpoint and body depending on if we're registering or logging in
        if (isRegister) {
            // Name is also required when registering
            authData.name = name
            url = url + 'users'
        }
        else {
            // Standard login
            url = url + 'auth'
        }
        
        console.log(url)
        // Send our request to the backend
        // TODO: Do we need to implement an API key to prevent malicious request sending? Probably.
        // Add as a param; url += ?key=API_KEY
        axios.post(url, authData)
            .then(response => {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('expirationDate', response.data.timeout)
                localStorage.setItem('userId', response.data.username)
                dispatch(authSuccess(response.data.token, response.data.username))
                dispatch(checkAuthTimeout(response.data.timeout))
            })
            .catch(err => {
                console.log('auth error of ', err)
                dispatch(authFail(err))
            })
        
    }
}

// Logout handler handles all cleanup work we need to execute when
// logging out, followed by dispatching our logout action
export const logoutHandler = () => {
    return dispatch => {
        // Remove local storage info
        localStorage.removeItem('token')
        localStorage.removeItem('expirationDate')
        localStorage.removeItem('userId')
        // Remove any list information
        dispatch(listClear())
        // Remove any problem information
        dispatch(problemsClear())
        // Log us out
        dispatch(logout())
    }
}