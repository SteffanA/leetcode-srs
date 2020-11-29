import * as actions from './actionTypes'
import * as api from '../../shared/api_calls/problems'
import {getProblemToNextSubTime} from '../../shared/api_calls/problemStatuses'

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

const problemsGetProblemsSuccess = (problems, firstProblem, probToTON) => {
    return {
        type: actions.PROBLEMS_RETRIEVE,
        problems: problems,
        firstProblem: firstProblem,
        problemIdToTimeOfNextSub: probToTON,
    }
}

const problemsSetTONSuccess = (probToTON) => {
    return {
        type: actions.PROBLEMS_SET_TON,
        problemIdToTimeOfNextSub: probToTON,
    }
}

// BEGIN EXPORTS


export const problemSetCurrent = (problem) => {
    console.log('prob set current')
    console.log(problem)
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
        try {
            const response = await api.getAllProblemsForList(list._id)
            const firstProblem = response[0]
            dispatch(problemsGetProblemsSuccess(response, firstProblem, null))
        } catch (error) {
            console.error('Error getting all for list.')
            console.error(error)
            dispatch(problemsClear())
            dispatch(problemError(error.response))
        }
    }
}

// Get all problems for a list and store in Redux sorted by time-to-next submission
export const problemsGetAllForListSorted = (list) => {
    return async dispatch => {
        // Start the problem process
        dispatch(problemStart)
        // Check that we were passed a list
        if (!list) {
            dispatch(problemError('No list provided.'))
            return
        }
        try {
            const response = await api.getAllProblemsForListSorted(list._id)
            if (Array.isArray(response) && response.length > 0) {
                const firstProblem = response[0]
                const problemIds = response.map((problem) => problem._id)
                const probToTime = await getProblemToNextSubTime(problemIds)
                dispatch(problemsGetProblemsSuccess(response, firstProblem, probToTime))
            }
            else {
                // Successful call,but list contains no problems
                dispatch(problemsGetProblemsSuccess(null, null, null))
            }
        } catch (error) {
            console.error('Error getting problems for list sorted.')
            console.error(error)
            dispatch(problemsClear())
            dispatch(problemError(error.response))
        }
    }
}

// Get all problems in DB and store in Redux
export const problemsGetAll = () => {
    return async dispatch => {
         // Start the problem process
         dispatch(problemStart)

         // Get all problems
        try {
            const response = await api.getAllProblems()
            const firstProblem = response[0]
            dispatch(problemsGetProblemsSuccess(response, firstProblem, null))
        } catch (error) {
            console.error('Error getting all problems.')
            console.error(error)
            dispatch(problemsClear())
            dispatch(problemError(error.response))
        }
    }
}

// Store a subset of problems based on the problem numbers in redux
// Start and end can be empty
export const problemsGetSome = (start, end) => {
    return async dispatch => {
         // Start the problem process
         dispatch(problemStart)

         // Get our subset of problems
        try {
            const response = await api.getSubsetOfProblems(start, end)
            const firstProblem = response[0]
            dispatch(problemsGetProblemsSuccess(response, firstProblem, null))
        } catch (error) {
            console.error('Error getting subset of problems.')
            console.error(error)
            dispatch(problemsClear())
            dispatch(problemError(error.response))
        }
    }
}

// Store a selection of problems based on search results for a specific
// term in redux.
export const problemsGetSearch = (term) => {
    return async dispatch => {
         // Start the problem process
         dispatch(problemStart)
         
         // Get our subset of problems containing the search term
        try {
            const response = await api.getProblemSearchResults(term)
            const firstProblem = response[0]
            dispatch(problemsGetProblemsSuccess(response, firstProblem, null))
        } catch (error) {
            console.error('Error getting search results for problems.')
            console.error(error)
            dispatch(problemsClear())
            dispatch(problemError(error.response))
        }
    }
}

// Given an array of full problem objects, set the stored problems to it
export const problemSetProblems = (problems) => {
    return async dispatch => {
        dispatch(problemStart)
        // Ensure we were passed an array
        if (!Array.isArray(problems)) {
            dispatch(problemError('No array provided for set problems.'))
            return
        }
        if (problems.length === 0) {
            // Short circuit here
            dispatch(problemsGetProblemsSuccess(problems, null, null))
            return
        }
        const firstProblem = problems[0]
        const problemIds = problems.map((problem) => problem._id)
        try {
            const probToTime = await getProblemToNextSubTime(problemIds)
            dispatch(problemsGetProblemsSuccess(problems, firstProblem, probToTime))
        } catch (error) {
            dispatch(problemError(error.response))
        }
    }
}

// Set the timeOfNextSubmissions given a provided mapping of problem
// ids to TON
export const problemsSetTimeToNextSubmissions = (tonObj) => {
    return dispatch => {
        dispatch(problemStart)
        console.log('Updating ton for probs')
        dispatch(problemsSetTONSuccess(tonObj))
    }
}