import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import Modal from 'react-modal'
import ProblemTable from '../SharedItems/ProblemTable/ProblemTable'
import Button from '../UI/Button/Button'

import * as statusAPI from '../../shared/api_calls/problemStatuses'
import * as problemAPI from '../../shared/api_calls/problems'
import * as subAPI from '../../shared/api_calls/submissions'
import SubmissionTable from '../SharedItems/SubmissionTable/SubmissionTable'
import useDeepCompareEffect, { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect'

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
    const [problems, setProblems] = useState(null)
    const [statuses, setStatuses] = useState(null)
    const [submissions, setSubmissions] = useState(null)
    const [loading, setLoading] = useState(false)
    const [subViewerOpen, setSubViewerOpen] = useState(false)

    let stats = null

    // Use effect-supporting functions

    // Get all problem statuses for the logged in user
    const getStatuses = useCallback(async () => {
        console.log('Getting statuses')
        try {
           const statuses = await statusAPI.getUsersProblemStatuses()
           setStatuses(statuses) 
           stats = statuses // We'll lose this but its okay
           console.log(statuses)
           console.log('Got statuses')
        } catch (error) {
            setStatuses(null)
            alert('Could not load problem statuses, try again later.')
            console.error(error)
        }
    }, [])

    // Get the full problem objects linked to each status
    const getProblemsFromStatuses = useCallback(async () => {
        console.log('Getting problems')
        try {
            const ourStats = (statuses ? statuses : stats)
            console.log(ourStats)
            if (ourStats) {
                const probIds = ourStats.map((status) => {
                    return status.problem
                })
                if (probIds) {
                    const probs = await problemAPI.getProblemsFromIDs(probIds)
                    console.log(probs)
                    setProblems(probs)
                }
                else {
                    console.log('Null stats')
                    setProblems(null)
                }
                console.log('Got problems')
            }
            // Statuses is null or undefined, just reset problems
            else {
                console.log('Null statuses')
                setProblems(null)
            }
        } catch (error) {
            setProblems(null)
            alert('Could not retrieve problems, try again later.')
            console.error(error)
        }
        console.log('Done getting problems')
    }, [statuses])
    useEffect(() => {
        // TODO: Need to re-init states?
        // Get all the user's problem statuses on page load
        const loadInfo = async () => {
            await getStatuses()
            await getProblemsFromStatuses()
            console.log('Refresh loadInfo')
        }
        if (isAuth) {
            loadInfo()
        }
        // If not auth, don't try to load anything
    }, [isAuth])

    // useDeepCompareEffectNoCheck(() => {
    //     console.log('Deep')
    // }, [problems])
    

    // Get all submissions linked to a problem for the logged in user
    // TODO: Not sure how to handle setLoading, expirement
    const getSubmissionsForProblem = async (problemID) => {
        // Start by setting loading true
        // setLoading(true)
        // get all the submissions for a particular problem
        try {
            const subs = await subAPI.getSubmissionsFromProblemID(problemID)
            setSubmissions(subs)
            // Set loading back to false
            setLoading(false)
        } catch (error) {
            setSubmissions(null)
            // setLoading(false)
            alert('Could not get submissions for problem, please try again later.')
            console.error(error)
        }
    }

    // Modal handlers

    // Close the submission viewer and reset loading/submissions
    const closeSubViewer = () => {
        setSubViewerOpen(false)
        setSubmissions(false)
        setLoading(true)
    }

    // Open the submission viewer and try to get submissions for the problem
    const openSubViewer = async (problemID) => {
        setSubViewerOpen(true)
        // setLoading(true)
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
                <SubmissionTable submissions={submissions} extraFields={null} loading={loading}/>
            </div>
        </Modal>
    )

    return (
        <div>
            <h2>Submission History:</h2>
            <ProblemTable problems={problems} extraFields={problemTableFields}/>
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
