import React, { Component, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as problemActions from '../../store/actions/problems'

export const ProblemViewer = (props) => {

    const {
        problems,
        getAllProblems
    } = props

    useEffect(() => {
        getAllProblems()
    }, [getAllProblems])

    

    let probs = null
    if (problems) {
        probs = problems.map(prob => {
            return (
            <div key={prob._id}> 
                {prob.id} {prob.name}  {prob.difficulty}  {prob.link} {prob.problem_text}
            </div>
            )
            }

        )
    }
    

    return (
        <div>
            {probs}
        </div>
    )
}

ProblemViewer.propTypes = {
    prop: PropTypes,
    problems: PropTypes.array,
}

const mapStateToProps = (state) => {
    return {
        problems: state.problems.curProblems,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // Get problems
        getAllProblems: () => dispatch(problemActions.problemsGetAll()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProblemViewer)
