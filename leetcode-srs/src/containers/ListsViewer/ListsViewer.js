import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import SearchBar from '../SharedItems/SearchBar/SearchBar'
import Button from '../UI/Button/Button'
import Modal from 'react-modal'
import ProblemTable from '../SharedItems/ProblemTable/ProblemTable'
import * as api from '../../shared/api_calls/lists'
import {getProblemsFromIDs} from '../../shared/api_calls/problems'
import {listsGetAll} from '../../store/actions/lists'
import Spinner from '../UI/Spinner/Spinner'

// TODO: Generize this a bit, I'll want to reuse this for viewing
// private lists too as a part of LCS-4
export const ListsViewer = (props) => {
    // Deconstruct our props
    // const {
    // } = props

    const INIT_SEARCH_TERM = 'Search List Names'

    // Setup state for our lists and search term
    const [lists, setLists] = useState([])
    const [searchTerm, setSearchTerm] = useState(INIT_SEARCH_TERM)
    const [problems, setProblems] = useState([])
    const [problemsOpen, setProblemsOpen] = useState(false)
    // States for if we're loading the lists or problems in the list
    const [loadingLists, setLoadingLists] = useState(false)
    const [loadingProblems, setLoadingProblems] = useState(false)

    // Submission handler to pass to our search bar
    const handleSubmit = async (event, term) => {
        event.preventDefault()
        setLoadingLists(true)
        // Ignore requests that match the init
        // TODO: Need a cleaner way to handle this, same as in ProblemViewer
        if (term && term.localeCompare(INIT_SEARCH_TERM) !== 0) {
            try {
                const res = await api.searchPublicLists(term)
                if (res.length === 0) {
                    // No result returned - warn user.
                    alert('No results for ' + term)
                }
                setLists(res)
            } catch (error) {
                alert('Failed to get results for search: ' + error)
                setLists([])
            }
        }
        setLoadingLists(false)
    }

    // Initialize our page results
    useEffect(() => {
        const getPublicLists = async () => {
            try {
                const res = await api.getPublicLists()
                setLists(res)
            } catch (e) {
                // Failed to get lists
                // TODO: Throw message up - similar to how burgerbuilder did
                alert('Failed to get Public lists - ' + e)
                setLists([])
            }
            setLoadingLists(false)
        }
        // Fill in the page results with either all public lists,
        // or the current search term
        setLoadingLists(true)
        if (searchTerm.localeCompare(INIT_SEARCH_TERM) === 0) {
            getPublicLists()
        }
        else {
            handleSubmit(new Event(), searchTerm)
        }
    }, [])

    // Function to provide to our search bar so we know what the current
    // search term is up here
    const updateSearchTerm = (term) => {
        setSearchTerm(term)
    }

    // Function to call our list cloning API when list clone button is pressed
    const cloneListHandler = async (event, id) => {
        event.preventDefault()
        try {
            const res = await api.clonePublicList(id)
            if (process.env.NODE_ENV === 'development') {
                console.log(res)
            }
            alert('List successfully cloned.')
            // Update the Redux user's lists
            props.getLists()
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Clone list error:')
                console.log(error)
            }
            alert('Unable to clone list, please try again later.')
        }
    }

    // Modal handlers

    const openProblems = async (event, probs) => {
        event.preventDefault()
        // Grab the problems for the list and store it in curProblems
        // Probs is an array containing an Object with just the _id field
        // We need to create an array of the full Problem objects
        setProblemsOpen(true)
        setLoadingProblems(true)
        const ids = probs.map(prob => prob._id)
        try {
            const fullProbs = await getProblemsFromIDs(ids)
            setProblems(fullProbs)
        }
        catch (e) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Error getting problems from IDS in listViewer ' + e)
            }
            
            setProblems([])
        }
        setLoadingProblems(false)
    }

    const closeProblems = (event) => {
        event.preventDefault()
        setProblems(null)
        setProblemsOpen(false)
    }


    // JSX

    let listsOutput = null
    if (lists) {
        if (process.env.NODE_ENV === 'development') {
            console.log(lists)
        }
        listsOutput = lists.map(list => {
            return (
                <tr key={list._id} className='text-center'>
                    <td>{list.name}</td>
                    <td>{list.problems.length}</td>
                    <td>
                        <Button btnType="Success" clicked={(event) => openProblems(event, list.problems)}>
                            View Problems
                        </Button>
                    </td>
                    {/*Only display cloning when logged in*/}
                    { props.isAuth && 
                    (<td>
                        <Button btnType="Success" clicked={(event) => cloneListHandler(event, list._id)}>
                            Clone List
                        </Button>
                    </td>
                    )}
                </tr>
            )
        })
    }


    // For visuals: Table, 3 columns: Name, # of problems, View Problems, Clone
    return (
        <div>
            <SearchBar defaultText={INIT_SEARCH_TERM} handleSubmit={handleSubmit} termGetter={updateSearchTerm}/>
            {!loadingLists && (
            <table>
                <tbody>
                    <tr className='center-text'>
                        <th>List Name</th>
                        <th>Number of Problems</th>
                        <th>View</th>
                        {/*Only display cloning when logged in*/}
                        {props.isAuth && (<th>Clone</th>)}
                    </tr>
                    {listsOutput}
                </tbody>
            </table>
            )}
            {loadingLists && <Spinner/>}
            <Modal
                isOpen={problemsOpen}
                onAfterOpen={null}
                onRequestClose={closeProblems}
                contentLabel="Public List Problems Modal"
            >
                <div>
                    <Button btnType="Success" clicked={closeProblems}>Back to Public List Viewer</Button>
                </div>
                <ProblemTable problems={problems} extraFields={null} loading={loadingProblems}/>
            </Modal>
        </div>
    )
}

ListsViewer.propTypes = {
    isAuth: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => {
    return {
        isAuth: state.auth.token !== null,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getLists: () => dispatch(listsGetAll()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ListsViewer)
