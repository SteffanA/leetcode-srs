import React, { useEffect, useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import Modal from 'react-modal'
import ProblemTable from '../SharedItems/ProblemTable/ProblemTable'
import Button from '../UI/Button/Button'

import * as statusAPI from '../../shared/api_calls/problemStatuses'
import * as problemAPI from '../../shared/api_calls/problems'
import * as subAPI from '../../shared/api_calls/submissions'
import SubmissionTable from '../SharedItems/SubmissionTable/SubmissionTable'

/*
This page displays a list of all problems with
submission history for the logged in user.

The user can select a problem to view all recorded submissions for the problem.
*/
const SubmissionHistory = props => {
    // Deconstruct our props
    const {
        isAuth,
    } = props

// Hooks
    // Store our submissions/problems retrieved
    const [problems, setProblems] = useState(null)
    const [submissions, setSubmissions] = useState(null)
    // Store the loading status for our two tables
    const [loadingSubmission, setLoadingSubmissions] = useState(false)
    const [loadingProblems, setLoadingProblems] = useState(false)
    // Determine if modal is open for submission viewer
    const [subViewerOpen, setSubViewerOpen] = useState(false)

    const statusArray = useRef(null)

    // UseEffect supporting functions

    // Get all problem statuses for the logged in user
    const getStatuses = useCallback(async () => {
        try {
           const statuses = await statusAPI.getUsersProblemStatuses()
           statusArray.current = statuses // We'll lose this but its okay
        } catch (error) {
            statusArray.current = null
            alert('Could not load problem statuses, try again later.')
            console.error(error)
        }
    }, [statusArray])

    // Get the full problem objects linked to each status
    const getProblemsFromStatuses = useCallback(async () => {
        try {
            if (statusArray.current) {
                const probIds = statusArray.current.map((status) => {
                    return status.problem
                })
                if (probIds) {
                    const probs = await problemAPI.getProblemsFromIDs(probIds)
                    setProblems(probs)
                    setLoadingProblems(false)
                }
                else {
                    setProblems(null)
                    setLoadingProblems(false)
                }
            }
            // Statuses is null or undefined, just reset problems
            else {
                setProblems(null)
                setLoadingProblems(false)
            }
        } catch (error) {
            setProblems(null)
            setLoadingProblems(false)
            alert('Could not retrieve problems, try again later.')
            console.error(error)
        }
    }, [statusArray, setProblems, setLoadingProblems])

    // Load the user's problem statuses and problem info
    useEffect(() => {
        // Get all the user's problem statuses on page load
        const loadInfo = async () => {
            await getStatuses()
            await getProblemsFromStatuses()
        }
        setLoadingSubmissions(true)
        setLoadingProblems(true)
        if (isAuth) {
            loadInfo()
        }
        // If not auth, don't try to load anything
    }, [isAuth, setLoadingProblems, setLoadingSubmissions, getStatuses, getProblemsFromStatuses])

    // Get all submissions linked to a problem for the logged in user
    const getSubmissionsForProblem = async (problemID) => {
        // get all the submissions for a particular problem
        try {
            const subs = await subAPI.getSubmissionsFromProblemID(problemID)
            setSubmissions(subs)
            // Set loading back to false
            setLoadingSubmissions(false)
        } catch (error) {
            setSubmissions(null)
            alert('Could not get submissions for problem, please try again later.')
            console.error(error)
        }
    }

    // Modal handlers

    // Close the submission viewer and reset loading/submissions
    const closeSubViewer = () => {
        setSubViewerOpen(false)
        setSubmissions(false)
        setLoadingSubmissions(true)
    }

    // Open the submission viewer and try to get submissions for the problem
    const openSubViewer = async (problemID) => {
        setSubViewerOpen(true)
        await getSubmissionsForProblem(problemID)
    }

    // Setup for problem table - add a link to open the submissions for the problem
    const createSubmissionTableOpener = (problem) => {
        // Create a clickable button that opens the sub viewer for the problem
        const subViewBtn = (
            <Button btnType="Success" clicked={() => openSubViewer(problem._id) }>
                View Submissions
            </Button>
        )
        // Return as JSX array for proper rendering
        return ([subViewBtn])
    }
    const problemTableFields = [
        {
            'title': 'View Submissions',
            'generator' : createSubmissionTableOpener,
        }
    ]
// JSX

    const submissionViewerModal = (
        <Modal
            isOpen={subViewerOpen}
            onAfterOpen={null}
            onRequestClose={closeSubViewer}
            contentLabel="Submission Viewer Modal"
        >
            <div>
                <Button btnType="Danger" clicked={closeSubViewer}>Exit Submission Viewer</Button>
            </div>
            <div>
                <SubmissionTable submissions={submissions} extraFields={null} loading={loadingSubmission}/>
            </div>
        </Modal>
    )

    return (
        <div>
            <h2>Submission History:</h2>
            <ProblemTable problems={problems} extraFields={problemTableFields} loading={loadingProblems}/>
            {submissionViewerModal}
        </div>
    )
}

SubmissionHistory.propTypes = {
    isAuth : PropTypes.bool.isRequired
}

const mapStateToProps = (state) => {
    return {
        isAuth: state.auth.token !== null,
    }
}

export default connect(mapStateToProps, null)(SubmissionHistory)
