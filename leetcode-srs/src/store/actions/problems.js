import * as actions from './actionTypes'
import * as api from '../../shared/api_calls/problems'

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

const handleGenericProblemGetResponse = (response) => {
    return dispatch => {
        if (response === undefined || response === null || typeof(response) === String) {
            // Failed to gather problems for some reason
            // Clear out the problems if we failed to retrieve any. If we're swapping between lists,
            // this might happen and we don't want to display problems associated w/ another list.
            console.log('Errored response for generic problem dispatch: ')
            console.log(response)
            dispatch(problemsClear())
            dispatch(problemError(response))
            return
        }
        // Otherwise we got problems successfully
        const firstProblem = response[0]
        dispatch(problemsGetProblemsSuccess(response, firstProblem))
    }
}

// BEGIN EXPORTS

export const problemSetCurrent = (problem) => {
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

// Get all problems for a list and store in Redux
export const problemsGetAllForList = (list) => {
    return async dispatch => {
        // Start the problem process
        dispatch(problemStart)
        // Check that we were passed a list
        if (!list) {
            dispatch(problemError('No list provided.'))
            return
        }
        const response = await api.getAllProblemsForList(list.id)
        dispatch(handleGenericProblemGetResponse(response))
    }
}

// Get all problems in DB and store in Redux
export const problemsGetAll = () => {
    return async dispatch => {
         // Start the problem process
         dispatch(problemStart)
         // Get all problems
         
        const response = await api.getAllProblems()
        dispatch(handleGenericProblemGetResponse(response))
    }
}

// Store a subset of problems based on the problem numbers in redux
// Start and end can be empty
export const problemsGetSome = (start, end) => {
    return async dispatch => {
         // Start the problem process
         dispatch(problemStart)

         // Get our subset of problems
        const response = await api.getSubsetOfProblems(start, end)
        dispatch(handleGenericProblemGetResponse(response))
    }
}

// Store a selection of problems based on search results for a specific
// term in redux.
export const problemsGetSearch = (term) => {
    return async dispatch => {
         // Start the problem process
         dispatch(problemStart)
         
         // Get our subset of problems containing the search term
        const response = await api.getProblemSearchResults(term)
        dispatch(handleGenericProblemGetResponse(response))
    }
}