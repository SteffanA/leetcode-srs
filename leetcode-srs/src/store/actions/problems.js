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
            dispatch(problemError('User not logged in!'))
        }
        else {
            // Get the problem's for a particular list.
            let url = process.env.REACT_APP_HOST_URL + '/api/lists/' + list.id + '/problems'
            const config = {
                headers: {
                    'x-auth-token': token,
                    'content-type': 'json',
                }
            }
            axios.get(url, config).then(response => {
                if (!response) {
                    // No data returned.
                    dispatch(problemError('No problems available.'))
                }
                else {
                    const firstProblem = response.data[0]
                    dispatch(problemsGetProblemsSuccess(response.data, firstProblem))
                }
                
            }).catch(error => {
                console.log('getProblems error of' , error, ' from ', url)
                // Clear out the problems if we failed to retreive any. If we're swapping between lists,
                // this might happen and we don't want to display problems associated w/ another list.
                dispatch(problemsClear())
                dispatch(problemError(error.msg))
            })
        }
    }
}

export const problemsGetAll = () => {
    return dispatch => {
         // Start the problem process
         dispatch(problemStart)
         // Get all problems
         // TODO: Make this only return, say problems 1-50. Add as var
         // TODO: In future, exclude problems already part of current list
         // (since this'll be used to show problems we can add to cur list)
         let url = process.env.REACT_APP_HOST_URL + '/api/problems/'
         const config = {
             headers: {
                 'content-type': 'json',
             }
         }
         axios.get(url, config).then(response => {
             if (!response) {
                 // No data returned.
                 dispatch(problemError('No problems available.'))
             }
             else {
                 const firstProblem = response.data[0]
                 dispatch(problemsGetProblemsSuccess(response.data, firstProblem))
             }
             
         }).catch(error => {
             console.log('getProblems error of' , error, ' from ', url)
             // Clear out the problems if we failed to retreive any. If we're swapping between lists,
             // this might happen and we don't want to display problems associated w/ another list.
             dispatch(problemsClear())
             dispatch(problemError(error.msg))
         })
    }
}

export const problemSetCurrent = (problem) => {
    console.log('setting current problem to: ', problem)
    return {
        type: actions.PROBLEMS_SET_CURRENT,
        curProblem: problem,
    }
}

export const problemsClear = () => {
    return {
        type: actions.PROBLEMS_CLEAR,
    }
}
