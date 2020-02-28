import * as actionTypes from './actionTypes'
import axios from 'axios'

// Functions for our auth actions are here

// Signal to reducer that auth has started
export const authStart = () => {
    return {
        type: actionTypes.AUTH_START,
    }
}

// Send success action and payload to reducer
export const authSuccess = (token, name) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        userId: name,
    }
}

// Logout our user when token expires
export const checkAuthTimeout = (expiresIn) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout())
        }, expiresIn * 1000)
    }
}

// Handle user logout & signal reducer
export const logout = () => {
    // Remove local storage info
    localStorage.removeItem('token')
    localStorage.removeItem('expirationDate')
    localStorage.removeItem('userId')
    return {
        type: actionTypes.AUTH_LOGOUT,
    }
}

// Signal to our reducer that auth has failed
export const authFail = (error) => {
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
            // Logout if no token; no effect if not logged in
            dispatch(logout())
        }
        else {
            // We have a token stored; check if it's still valid
            const expirationDate = new Date(localStorage.getItem('expirationDate'))
            // Check if token has already expired
            if (expirationDate > new Date()) {
                // Still valid, let's login with it
                const name = localStorage.getItem('userId')
                // Mark us successfully logged in
               dispatch(authSuccess(token, name))
               // Start our auth timeout timer
               dispatch(checkAuthTimeout(expirationDate.getTime() - new Date().getTime()))
            }
            else {
                // Expired
                dispatch(logout())
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
        let url = process.env.REACT_APP_API_PROTOCOL + '://' + process.env.REACT_APP_API_URL + ':3000/api/'
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
                console.log('success')
                // TODO: Add expiration time to the response for auth/login
                const expirationDate = new Date(new Date().getTime() + (3600 * 1000))
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('expirationDate', expirationDate)
                // TODO: Have the register and the login return a name field in addition to token.
                if (isRegister) {
                    localStorage.setItem('userId', name)
                }
                else {
                    // TODO: Delete me
                    localStorage.setItem('userId', 'name')
                }
                dispatch(authSuccess(response.data.token, name))
                dispatch(checkAuthTimeout(response.data.expiresIn))
            })
            .catch(err => {
                console.log('err')
                console.log(err)
                dispatch(authFail(err))
            })
        
    }
}