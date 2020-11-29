import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {getProblemSearchResults, getSubsetOfProblems} from '../../../shared/api_calls/problems'
import * as problemActions from '../../../store/actions/problems'
import * as listActions from '../../../store/actions/lists'
import classes from './ProblemViewer.module.css'
import Input from '../../UI/Input/Input'
import Button from '../../UI/Button/Button'
import SearchBar from '../../SharedItems/SearchBar/SearchBar'
import ProblemTable from '../../SharedItems/ProblemTable/ProblemTable'
// TODO: The page is currently being refreshed with a query url schema upon form submission
// Why is this, and how can I prevent it? preventDefault on the form button does nothing


export const ProblemViewer = (props) => {
    /* Props and hooks */
    const {
        curList,
        curProblems,
        listErrors,
        updateListProblems,
        getProblemsForList
    } = props

    // Keep track of any problems that have been updated to be included
    // or removed from a list
    const [
        currentProblemsAndState,
        setUpdatedProblems
    ] = useState(new Map())

    // Keep track of what problems we've gathered via the
    // API calls
    const [
        curProblemResults,
        setProblemResults
    ] = useState([])

    const [
        searchTerm,
        setSearchTerm
    ] = useState('')

    const [loadingProblems, setLoadingProblems] = useState(false)

    // Constants definining the index of states within the currentProblemsAndState 
    // mapped arrays
    const TOUCHED_INDEX = 0 // Has problem been touched (made to add or remove)
    const ADDING_INDEX = 1 // Should this problem be added (or removed if false)

    // Define this func earlier than other function so it can be utilized in
    // the useEffect hook below
    // This will setup the initial mapping of the problems displayed
    // and if they are in the current list or not
    const setInitialProblemStates = () => {
        console.debug('Setting initial problem states')
        // Set the current problem state
        // Create a copy of the current state that we can pass to the update hook
        if (curProblemResults === null) {
            // Exit early
            return
        }
        const updatedVersion = new Map(currentProblemsAndState)
        // Add all problems currently in the list to a set for easy lookup
        const current_lists_problems = new Set()
        // Ensure curProblems isn't null
        if (curProblems) {
            curProblems.forEach((problem) => {
                current_lists_problems.add(problem._id)
            })
        }
        curProblemResults.forEach((problem) => {
            // Only update the state if the problem is newly seen
            // otherwise keep whatever updates the user made on the page already
            if (!updatedVersion.has(problem._id)) {
                // Map the problem ID to a tuple of touched, adding
                // If touched is true, we've updated this value
                // If adding is true, we're adding this problem to the list
                // (as opposed to removing it from the list)
                if (!current_lists_problems.has(problem._id)) {
                    // Default - not in list
                    updatedVersion.set(problem._id, [false, false])
                }
                else {
                    // already in list, set adding to True so we setup for removal
                    updatedVersion.set(problem._id, [false, true])
                }
            }
        })
        setUpdatedProblems(updatedVersion)
    }


    // Load problems on startup into the table
    useEffect(() => {
        // If we have no results, get the first 50 problems
        if (curProblemResults === null || curProblemResults.length === 0) {
            const getProblems = async () => {
                try {
                    const results = await getSubsetOfProblems(0, 50)
                    setProblemResults(results)
                } catch (error) {
                    console.debug('Failed to get subset of problems')
                    console.debug(error)
                    alert('Failed to load problems. Please try again later.')
                }
                setLoadingProblems(false)
            }

            setLoadingProblems(true)
            getProblems()
        }
        else {
            console.debug('ProblemViewer: problems already exist')
            console.debug(curProblemResults)
        }
        console.log('Problem viewer refreshed')
        // Setup the problem states for any new-in-view problems
        setInitialProblemStates()
    }, [curProblemResults, getProblemSearchResults, setProblemResults])

    // Declare our function earlier than the others so useEffect can run appropriately
    // Handle submission of a search term for a problem
    // We will replace the problems displayed on the page with the results
    const handleSubmit = async (event, searchTermy) => {
        event.preventDefault()
        setLoadingProblems(true)
        // TODO: Not sure if this is a great approach to take,
        // considering it's not out of the realm of possibility for
        // an actual LC problem to be called this.
        // TODO: Does this actually get called? Look into Code Coverage
        if (searchTermy === 'Search for a Problem') {
            try {
                const results = await getSubsetOfProblems(0, 50)
                setProblemResults(results)
            } catch (error) {
                console.debug('Failed to get subset of problems')
                console.debug(error)
                alert('Failed to load problems. Please try again later.')
            }
        }
        else {
            // TODO: Need to handle errors gracefully
            try {
                const results = await getProblemSearchResults(searchTermy)
                setProblemResults(results)
            } catch (error) {
                console.debug('Error when trying to get search results.')
                console.debug(error)
                alert('Search failed - please try again later.')
            }
        }
        setLoadingProblems(false)
    }

    // Use this to override any enter key press on the page
    // This will prevent page reloads when we submit our form (text box & submit button)
    // in addition to allowing easy refreshes of results
    useEffect(() => {
        const listener = event => {
        if (event.code === "Enter" || event.code === "NumpadEnter") {
            console.debug('Search term on enter refresh is ' + searchTerm)
            handleSubmit(event, searchTerm)
        }
        };
        document.addEventListener("keydown", listener);
        return () => {
        document.removeEventListener("keydown", listener);
        };
    }, [handleSubmit]);


    /* Submission and change handlers */

    // Save any changes to the list that were made
    const saveChanges = async (event) => {
        event.preventDefault()
        // Take the list of problems and write out the changes
        // The API will expect an array of JSON objects containing IDs
        // and whether to add or remove the problem.
        const updatedProblems = []
        currentProblemsAndState.forEach((state, id) => {
            // A null update state indicates the state of the problem in the list didn't change
            if (state !== null && state[TOUCHED_INDEX] !== false) {
                updatedProblems.push({
                    "id" : id,
                    "add" : state[ADDING_INDEX]
                })
            }
        })
        // Send the request to update our list
        try {
            await updateListProblems(updatedProblems, curList._id)
        } catch (error) {
            console.error('Error after updateListProblems')
            alert('Save failed! Please try again later.')
            return
        }
        // Check for any errors after our request finishes
        if (listErrors !== null) {
            alert('Save failed! Please try again later.')
            return
        }
        alert('Changes saved!')

        // Update problems now
        try {
            await getProblemsForList(curList)
        } catch (error) {
            console.error('Error after getProblemsForList')
        }
        // Reset the currentProblemsAndState mapping, since 'touched' and non touched
        // vars are going to be different now.
        setUpdatedProblems(new Map())
        setInitialProblemStates() 
    }

    
    // If we have more results than we allow on a page
    // use this to load the next
    // TODO: For now, if len of problems < 50, resubmit result but 50-100, etc
    // this may require another piece of state to track
    // TODO: Deferring this to a post MVP update
    // const loadNextResults = () => {
    //     console.log('load next')
    // }
    
    // If we aren't displaying the first page of results for a query,
    // use this to go back to prior results
    // const loadPrevResults = () => {
    //     console.log('load prev')
    // }


    // Update a selected problem state to either remove or
    // add it to a list based on what the current state already is
    const invertProblemState = (problem_id) => {
        console.log('Updating problem with id ' + problem_id + ' in list with id ' +
             curList.id + 'to ' + !currentProblemsAndState.get(problem_id)[ADDING_INDEX])
        let updatedState = new Map(currentProblemsAndState)
        let newVals = new Array(2)
        /* Why do we invert touched index in addition to state?
        The reason is because if we change the state, the change it back,
        it's as if we never changed anything, and we can avoid an attempt
        to change something that doesn't need to be changed on the backend.
        */
        newVals[TOUCHED_INDEX] = !(currentProblemsAndState.get(problem_id)[TOUCHED_INDEX])
        newVals[ADDING_INDEX] =!(currentProblemsAndState.get(problem_id)[ADDING_INDEX] )
        updatedState.set(problem_id, newVals)
        setUpdatedProblems(updatedState)
    }

    // Wrapper function to pass to search bar that lets us know
    // what the currently being searched term is from us (the parent)
    // We need the term to use in our hook on enter press on this page
    const updateSearchTerm = (term) => {
        setSearchTerm(term)
    }


    /* JSX creation */

    // Create an add-to-list or remove-from-list button depending
    // on if the problem passed is already inside the 
    const getAppropriateButton = (prob) => {
        const problem_id = prob._id
        const cur_state = currentProblemsAndState.get(problem_id)
        // If the problem isn't in the curState, or if it is but isn't in the list
        // Create an add-to-list button
        if ( (cur_state === undefined) || !(cur_state[ADDING_INDEX]) ) {
            return(
                <Button
                    btnType="Success"
                    clicked={() => invertProblemState(problem_id)}>
                        Add to List
                </Button>
            )
        }
        // Else create a remove from list button
        else {
            return(
                <Button
                    btnType="Danger"
                    clicked={() => invertProblemState(problem_id)}>
                        Remove From List
                </Button>
            )
        }
    }

    // Array of title/generator pairings for the ProblemTable generation
    const extraProblemFields = [
        {
            title : 'Add/Remove From List',
            generator: getAppropriateButton
        }
    ]


    return (
        <div>
            <SearchBar defaultText="Search for a Problem" handleSubmit={handleSubmit} termGetter={updateSearchTerm}/>
            <Input elementType="submit" value="Save Changes" clicked={saveChanges}/>
            <ProblemTable problems={curProblemResults} extraFields={extraProblemFields} loading={loadingProblems}/>
            {/*TODO: Add support for these results - will likely need to update the API
                        to allow for selective result filtering - aka, grab results 10-20
                        Also, add a button for selecting number of results displayed? 
                        
                NOTE: Deferring this to post MVP
                another NOTE:  This will likely be inside ProblemTable*/}
            {/* <div>
                <Button
                    btnType="Danger"
                    clicked={loadPrevResults}>
                        Previous Results
                </Button>
                <Button
                    btnType="Success"
                    clicked={loadNextResults}>
                        Next Results
                </Button>
            </div> */}
        </div>
    )
}

ProblemViewer.propTypes = {
    curProblems: PropTypes.array,
    getAllProblems: PropTypes.func,
    curList: PropTypes.object,
}

const mapStateToProps = (state) => {
    return {
        curList: state.lists.curList, // currently selected list
        curProblems: state.problems.curProblems, // Problems for the currently selected list
        listErrors: state.lists.error,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateListProblems: (updatedProblems, listID) => dispatch(listActions.listsUpdateProblems(updatedProblems, listID)),
        getProblemsForList: (list) => dispatch(problemActions.problemsGetAllForList(list)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProblemViewer)
