import * as actions from '../actions/actionTypes'
import { updateObject } from '../../shared/utility'

const initialState = {
    curProblem: null,
    curProblemName: null,
    curProblems: null,
    error: null,
    loading: false,
    problemIdToTimeToNextSub: null,
}

// Start up problem retrieval process
const problemsStart = (state, action) => {
    return updateObject(state, {
        error: null,
        loading: true,
    })
}

// Mark our problem action as having an error and store it
const problemsError = (state, action) => {
    return updateObject(state, {
        error: action.error,
        loading: false,
    })
}

// Update our state to reflect the problems in current list.
const problemsRetrieve = (state, action) => {
    // This little bit of hacky-ness is b/c not all lists have to
    // have any problems associated with it.
    // This action works w/o the fix, but will throw an error.
    let firstProbName = null
    if (action.firstProblem) {
        firstProbName = action.firstProblem.name
    }
    return updateObject(state, {
        curProblem: action.firstProblem,
        curProblemName: firstProbName,
        curProblems: action.problems,
        problemIdToTimeToNextSub: action.problemIdToTimeToNextSub,
        error: null,
        loading: false,
    })
}

// Set the current problem to one from the current list
const problemsSetCurrent = (state, action) => {
    return updateObject(state, {
        curProblem: action.curProblem,
        curProblemName: action.curProblem.name,
        loading: false,
    })
}

const problemsSetTTN = (state, action) => {
    return updateObject(state, {
        problemIdToTimeToNextSub: action.problemIdToTimeToNextSub,
    })
}

// Reset the problems state back to default
const problemsClear = (state, action) => {
    return updateObject(state, {
        curProblem: null,
        curProblemName: null,
        curProblems: null,
        problemIdToTimeToNextSub: null,
        error: null,
        loading: false,
    })
}

export const problemReducer = (state=initialState, action) => {
    switch(action.type) {
        case actions.PROBLEMS_START: return problemsStart(state, action)
        case actions.PROBLEMS_ERROR: return problemsError(state, action)
        case actions.PROBLEMS_RETRIEVE: return problemsRetrieve(state, action)
        case actions.PROBLEMS_SET_CURRENT: return problemsSetCurrent(state, action)
        case actions.PROBLEMS_SET_TTN: return problemsSetTTN(state, action)
        case actions.PROBLEMS_CLEAR: return problemsClear(state, action)
        default: return state
    }
}