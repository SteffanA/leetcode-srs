import React, {useEffect, useState, useCallback} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {getProblemSearchResults, getSubsetOfProblems} from '../../../shared/api_calls/problems'
import {createLink} from '../../../shared/utility'
import * as problemActions from '../../../store/actions/problems'
import * as listActions from '../../../store/actions/lists'
import classes from './ProblemViewer.module.css'
import Input from '../../UI/Input/Input'
import Button from '../../UI/Button/Button'
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

    // Keep track of the term being searched for
    // TODO: Should we store the last search term across the app via Redux?
    const [
        searchTerm,
        setSearchTerm
    ] = useState('Search for a Problem')

    // Keep track of the current search term query
    // This may be slightly different than the search term,
    // as this is set based on user input, and is sent to the
    // searchTerm on a delay so the searchTerm isn't constantly
    // updating as the user types
    const [
        query,
        setQuery
    ] = useState("Search for a Problem")

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


    // Define this func earlier than other function so it can be utilized in
    // the useEffect hook below
    // This will setup the initial mapping of the problems displayed
    // and if they are in the current list or not
    const setInitialProblemStates = () => {
        // Set the current problem state
        // Create a copy of the current state that we can pass to the update hook
        if (curProblemResults === null) {
            // Exit early
            return
        }
        const updatedVersion = new Map(currentProblemsAndState)
        console.log('Cur list in set initial problem state')
        console.log(curList)
        // Add all problems currently in the list to a set for easy lookup
        const current_lists_problems = new Set()
        // Ensure curProblems isn't null
        if (curProblems) {
            curProblems.forEach((problem) => {
                current_lists_problems.add(problem._id)
            })
        }
        console.log('cur problems are: ')
        console.log(curProblems)
        console.log('generated set:')
        console.log(current_lists_problems)
        curProblemResults.forEach((problem) => {
            // Only update the state if the problem is newly seen
            // otherwise keep whatever updates the user made on the page already
            if (!updatedVersion.has(problem._id)) {
                console.log('setting problem ' + problem + ' with id ' + problem._id)
                // Map the problem ID to a tuple of touched, adding
                // If touched is true, we've updated this value
                // If adding is true, we're adding this problem to the list
                // (as opposed to removing it from the list)
                if (!current_lists_problems.has(problem._id)) {
                    // Default - not in list
                    updatedVersion.set(problem._id, [false, false])
                }
                else {
                    console.log(problem.name + ' is already in list')
                    // already in list, set adding to True so we setup for removal
                    updatedVersion.set(problem._id, [false, true])
                }
            }
        })
        setUpdatedProblems(updatedVersion)
    }

    // Constants definining the index of states within the currentProblemsAndState 
    // mapped arrays
    const TOUCHED_INDEX = 0 // Has problem been touched (made to add or remove)
    const ADDING_INDEX = 1 // Should this problem be added (or removed if false)

    // Load problems on startup into the table
    useEffect(() => {
        // TODO: If we enter an invalid result, we infinitely page refresh
        // Need to fix this pretty badly.
        if (curProblemResults === null || curProblemResults.length === 0) {
            // Helper function to allow us to execute async in the hook
            const getProblems = async (searchTerm) => {
                let results = null
                // TODO: This is awful, figure out the good solution
                if (searchTerm === null || searchTerm === '' || searchTerm === 'Search for a Problem') {
                    console.debug('Page refresh: getting subset')
                    results = await getSubsetOfProblems(0, 50)
                }
                else {
                    console.debug('Page refresh: getting res for ' + searchTerm)
                    results = await getProblemSearchResults(searchTerm)
                }
                setProblemResults(results)
            }
            getProblems(searchTerm)
        }
        else {
            console.debug('ProblemViewer: problems already exist')
            console.debug(curProblemResults)
        }
        console.log('Problem viewer refreshed')
        // Setup the problem states for any new-in-view problems
        setInitialProblemStates()
    }, [curProblemResults, searchTerm, getProblemSearchResults, setProblemResults])

    // Declare our function earlier than the others so useEffect can run appropriately
    // Handle submission of a search term for a problem
    // We will replace the problems displayed on the page with the results
    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            // TODO: Not sure if this is a great approach to take,
            // considering it's not out of the realm of possibility for
            // an actual LC problem to be called this.
            // TODO: Does this actually get called? Look into Code Coverage
            if (searchTerm === 'Search for a Problem') {
                getSubsetOfProblems(0,50)
            }
            else {
                const results = await getProblemSearchResults(searchTerm)
                setProblemResults(results)
            }
        },
        [searchTerm]
    )

    // Use this to override any enter key press on the page
    // This will prevent page reloads when we submit our form (text box & submit button)
    // in addition to allowing easy refreshes of results
    useEffect(() => {
        const listener = event => {
        if (event.code === "Enter" || event.code === "NumpadEnter") {
            handleSubmit(event)
        }
        };
        document.addEventListener("keydown", listener);
        return () => {
        document.removeEventListener("keydown", listener);
        };
    }, [handleSubmit]);

    // Setup our hook so that we only update the search term after a 
    // given period
    useEffect (() => {
        const timeOutId = setTimeout(async () => {
            console.log('Auto updating and querying with ' + query)
            setSearchTerm(query)
            // Auto-update the results
            // Use query since the search term may not be set in time
            // for getProblemSearchResults to execute on the right text
            const results = await getProblemSearchResults(query)
            setProblemResults(results)
        }, 1000)
        return () => clearTimeout(timeOutId)
    }, [setSearchTerm, query])

    /* Submission and change handlers */

    const handleChange = (event) => {
        setQuery(event.target.value)
    }

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
        await updateListProblems(updatedProblems, curList.id)
        // Check for any errors after our request finishes
        if (listErrors !== null) {
            alert('Save failed! Please try again later.')
            return
        }
        alert('Changes saved!')

        // Update problems now
        await getProblemsForList(curList)
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

    /* JSX creation */

    // Create an add-to-list or remove-from-list button depending
    // on if the problem passed is already inside the 
    const getAppropriateButton = (problem_id) => {
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

    // Map the difficulty of a problem from a number to a String
    const difficultyMapping = {
        '1' : 'Easy',
        '2' : 'Medium',
        '3' : 'Hard'
    }

    let probs = null
    if (curProblemResults) {
        console.debug(curProblemResults)
        probs = curProblemResults.map(prob => {
            return (
                <tr key={prob._id}>
                    <td> {prob.id} </td>
                    <td><a href={createLink(prob.link)}>{prob.name}</a></td>
                    <td><b>{difficultyMapping[prob.difficulty]}</b></td>
                    <td>{prob.problem_text}</td>
                    <td>{getAppropriateButton(prob._id)}</td>
                </tr>
            )
            }

        )
    }


    return (
        <div>
            <form>
                <label>
                    Search for a problem:
                    <Input elementType='input' name="name" value={query} changed={handleChange}/>
                </label>
                <Input elementType="submit" value="Submit" clicked={handleSubmit}/>
            </form>
            <Input elementType="submit" value="Save Changes" clicked={saveChanges}/>
            <table>
                <tbody>
                    <tr>
                        <th>ID</th>
                        <th>Problem</th>
                        <th>Difficulty</th>
                        <th>Problem Text</th>
                        <th>Add/Remove From List</th>
                    </tr>
                    {probs}
                </tbody>
            </table>
            {/*TODO: Add support for these results - will likely need to update the API
                        to allow for selective result filtering - aka, grab results 10-20
                        Also, add a button for selecting number of results displayed? 
                        
                NOTE: Deferring this to post MVP*/}
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
