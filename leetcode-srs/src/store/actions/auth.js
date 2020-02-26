import * as actionTypes from './actionTypes'
import axios from 'axios'

// Functions for our auth actions are here
export const authStart = () => {
    return {
        type: actionTypes.AUTH_START,
    }
}