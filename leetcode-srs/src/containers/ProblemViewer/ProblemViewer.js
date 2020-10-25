import React, {useEffect, useState, useRef, useCallback} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as problemActions from '../../store/actions/problems'
import classes from './ProblemViewer.module.css'
import Input from '../UI/Input/Input'
import Button from '../UI/Button/Button'
// TODO: The page is currently being refreshed with a query url schema upon form submission
// Why is this, and how can I prevent it? preventDefault on the form button does nothing

// TODO: Move the trace update to a common func library
// Function stolen from stack overflow to trace what prop changed
// to cause a page refresh
function useTraceUpdate(props) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.debug('Changed props:', changedProps);
    }
    prev.current = props;
  });
}

export const ProblemViewer = (props) => {
    /* Props and hooks */
    const {
        problems,
        getProblemSubset,
        getSearchResults
    } = props

    const [
        searchTerm,
        setSearchTerm
    ] = useState('Search for a Problem')

    // Map the difficulty of a problem from a number to a String
    const difficultyMapping = {
        '1' : 'Easy',
        '2' : 'Medium',
        '3' : 'Hard'
    }


    useEffect(() => {
        if (problems == null) {
            // TODO: This is awful, figure out the good solution
            if (searchTerm === null || searchTerm === '' || searchTerm === 'Search for a Problem') {
                getProblemSubset(0, 50)
            }
            else {
                getSearchResults(searchTerm)
            }
        }
        else {
            console.debug('ProblemViewer: problems already exist')
            console.debug(problems)
        }
        console.log('Problem viewer refreshed')
    }, [problems, getProblemSubset, getSearchResults, searchTerm])

    // Declare our function earlier than the others so useEffect can run appropriately
    // Handle submission of a search term for a problem
    // We will replace the problems displayed on the page with the results
    const handleSubmit = useCallback(
        (event) => {
            event.preventDefault()
            console.log('calling handle submit')
            console.log('Search term is ' + searchTerm)
            getSearchResults(searchTerm)
        },
        [searchTerm, getSearchResults]
    )

    // Use this to override any enter key press on the page
    useEffect(() => {
        const listener = event => {
        if (event.code === "Enter" || event.code === "NumpadEnter") {
            console.log("Enter key was pressed. Run your function.");
            handleSubmit(event)
        }
        };
        document.addEventListener("keydown", listener);
        return () => {
        document.removeEventListener("keydown", listener);
        };
    }, [handleSubmit]);

    /* Submission and change handlers */

    const handleChange = (event) => {
        // TODO: Set this up so it triggers auto-submit after say, 3sec of no change
        // TODO: I think there was also some code in a prior practice project
        // that prevented this from being called 129084x when typing something out?
        console.info('Calling handle change, setting search term to ' + event.target.value)
        setSearchTerm(event.target.value)
    }

    
    // If we have more results than we allow on a page
    // use this to load the next
    // TODO: For now, if len of problems < 50, resubmit result but 50-100, etc
    // this may require another piece of state to track
    const loadNextResults = () => {
        console.log('load next')
    }
    
    // If we aren't displaying the first page of results for a query,
    // use this to go back to prior results
    const loadPrevResults = () => {
        console.log('load prev')
    }

    // Simple helper to generate a link for a problem from a stub
    // TODO: Move this function to some general helper class and import it
    const createLink = (stub) => {
        return 'https://leetcode.com/problems/' + stub
    }

    // Adds a selected problem to the currently selected list
    const addProblemToList = (id) => {
        console.log('Adding problem with id ' + id + ' to list')
        return
    }
    

    /* JSX creation */

    const addToListButton = (id) => {
        return (
            <Button
                btnType="Success"
                clicked={() => addProblemToList(id)}>
                    Add to List
            </Button>
        )
    }

    let probs = null
    if (problems) {
        console.debug(problems)
        probs = problems.map(prob => {
            return (
                <tr key={prob._id}>
                    <td> {prob.id} </td>
                    <td><a href={createLink(prob.link)}>{prob.name}</a></td>
                    <td><b>{difficultyMapping[prob.difficulty]}</b></td>
                    <td>{prob.problem_text}</td>
                    <td>{addToListButton(prob._id)}</td>
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
                    <Input elementType='input' name="name" value={searchTerm} changed={handleChange}/>
                </label>
                <Input elementType="submit" value="Submit" clicked={handleSubmit}/>
            </form>
            <table>
                <tbody>
                    <tr>
                        <th>ID</th>
                        <th>Problem</th>
                        <th>Difficulty</th>
                        <th>Problem Text</th>
                        <th>Add to Current List</th>
                    </tr>
                    {probs}
                </tbody>
            </table>
            {/*TODO: Add support for these results - will likely need to update the API
                        to allow for selective result filtering - aka, grab results 10-20
                        Also, add a button for selecting number of results displayed? */}
            <div>
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
            </div>
        </div>
    )
}

ProblemViewer.propTypes = {
    problems: PropTypes.array,
    getAllProblems: PropTypes.func,
    getProblemSubset: PropTypes.func,
    getSearchResults: PropTypes.func,
}

const mapStateToProps = (state) => {
    return {
        problems: state.problems.curProblems,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // Get problems
        getProblemSubset: (start, end) => dispatch(problemActions.problemsGetSome(start, end)),
        getSearchResults: (term) => dispatch(problemActions.problemsGetSearch(term))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProblemViewer)
