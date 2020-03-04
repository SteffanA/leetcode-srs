import * as actions from './actionTypes'
import axios from 'axios'

// Functions for our problem-related actions live here

// Start up the Problem retrieval process
const problemStart = () => {
    return {
        type: actions.PROBLEMS_START,
    }
}

// Mark our problem action as having an error and store it
const problemError = (error) => {
    return {
        type: actions.PROBLEMS_ERROR,
        error: error,
    }
}

const problemsGetProblemsSuccess = (problems, firstProblem) => {
    return {
        type: actions.PROBLEMS_RETRIEVE,
        problems: problems,
        firstProblem: firstProblem,
    }
}

// BEGIN EXPORTS

export const problemsGetAllForList = (list) => {
    return dispatch => {
        // Start the problem process
        dispatch(problemStart)
        // Check that we were passed a list
        if (!list) {
            dispatch(problemError('No list provided.'))
            return
        }
        // Get the user's token from local storage
        const token = localStorage.getItem('token')
        if (!token) {
            // If there's no token, we can't get problems
            dispatch(listError('User not logged in!'))
        }
        else {
            // Get the problem's for a particular list.
            //TODO: Adjust the api call when we add call to get all problems for a list
            // Includes all of below.
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

export const problemSetCurrent = (problem) => {
    return {
        type: actions.PROBLEMS_SET_CURRENT,
        curProblem: problem,
    }
}