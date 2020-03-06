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
            console.log(list)
            // Get the problem's for a particular list.
            // TODO: Figure out why the _id changes to id and remove this hack
            let url = process.env.REACT_APP_HOST_URL + '/api/lists/'
            if (list.id) {
                url = url + list.id +'/problems'
            }
            else if (list._id) {
                url = url + list._id +'/problems'
            }
            else {
                dispatch(problemError('No problem ID!'))
            }
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
                    console.log('Got problems as ', response.data)
                    let firstProblem = null
                    if (response.data.length > 0) {
                        console.log(response.data.length, ' is greater than 0 i guess')
                        firstProblem = response.data[0]
                    }
                    dispatch(problemsGetProblemsSuccess(response.data, firstProblem))
                }
                
            }).catch(error => {
                console.log('problem get error of' , error, ' from ', url)
                // TODO: When this works as intended, causes infinite loop. Need to determine why.
                // Infinite loop is of exclusively the LIST_ERROR call; this seemed to have been called fine.
                dispatch(problemError(error.msg))
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