import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import * as listActions from '../../store/actions/lists'
import SearchBar from '../SharedItems/SearchBar/SearchBar'
import Button from '../UI/Button/Button'
import Modal from 'react-modal'
import ProblemTable from '../SharedItems/ProblemTable/ProblemTable'
import * as api from '../../shared/api_calls/lists'
import {getProblemsFromIDs} from '../../shared/api_calls/problems'

export const ListsViewer = (props) => {
    // Deconstruct our props
    const {
    } = props

    const INIT_SEARCH_TERM = 'Search List Names'

    // Setup state for our lists and search term
    const [lists, setLists] = useState([])
    const [searchTerm, setSearchTerm] = useState(INIT_SEARCH_TERM)
    const [problems, setProblems] = useState([])
    const [problemsOpen, setProblemsOpen] = useState(false)

    // Submission handler to pass to our search bar
    const handleSubmit = async (event, term) => {
        event.preventDefault()
        // Ignore requests that match the init
        // TODO: Need a cleaner way to handle this, same as in ProblemViewer
        if (term.localeCompare(INIT_SEARCH_TERM) !== 0) {
            try {
                const res = await api.searchPublicLists(term)
                setLists(res)
            } catch (error) {
                alert('Failed to get results for search: ' + error)
                setLists([])
            }
        }
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
        }
        // Fill in the page results with either all public lists,
        // or the current search term
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

    // JSX

    // Modal handlers
    const openProblems = async (event, probs) => {
        event.preventDefault()
        // Grab the problems for the list and store it in curProblems
        // Probs is an array containing an Object with just the _id field
        // We need to create an array of the full Problem objects

        const ids = probs.map(prob => prob._id)
        try {
            const fullProbs = await getProblemsFromIDs(ids)
            setProblems(fullProbs)
        }
        catch (e) {
            console.log('Error getting problems from IDS in listViewer ' + e)
            setProblems([])
        }
        setProblemsOpen(true)
    }

    const closeProblems = (event) => {
        event.preventDefault()
        setProblems(null)
        setProblemsOpen(false)
    }

    const test = () => {
        // e.preventDefault()
        console.log('clone')
    }

    let listsOutput = null
    if (lists) {
        console.log(lists)
        listsOutput = lists.map(list => {
            return (
                <tr key={list._id}>
                    <td>{list.name}</td>
                    <td>{list.problems.length}</td>
                    <td>
                        <Button btnType="Success" clicked={(event) => openProblems(event, list.problems)}>
                            View Problems
                        </Button>
                    </td>
                    <td>
                        <Button btnType="Success" clicked={test}>
                            Clone List
                        </Button>
                    </td>
                </tr>
            )
        })
    }


    // For visuals: Table, 3 columns: Name, # of problems, View Problems, Clone
    return (
        <div>
            <SearchBar defaultText={INIT_SEARCH_TERM} handleSubmit={handleSubmit} termGetter={updateSearchTerm}/>
            <table>
                <tbody>
                    <tr>
                        <th>List Name</th>
                        <th>Number of Problems</th>
                        <th>View</th>
                        <th>Clone</th>
                    </tr>
                    {listsOutput}
                </tbody>
            </table>
            <Modal
                isOpen={problemsOpen}
                onAfterOpen={null}
                onRequestClose={closeProblems}
                contentLabel="Public List Problems Modal"
            >
                <div>
                    <Button btnType="Success" clicked={closeProblems}>Back to Public List Viewer</Button>
                </div>
                <ProblemTable problems={problems} extraFields={null}/>
            </Modal>
        </div>
    )
}

export default (ListsViewer)
