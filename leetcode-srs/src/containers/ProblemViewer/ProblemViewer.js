import React, { Component, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as problemActions from '../../store/actions/problems'

export const ProblemViewer = (props) => {

    const {
        problems,
        getAllProblems,
        getProblemSubset
    } = props

    const [
        searchTerm,
        setSearchTerm
    ] = useState('Search for a Problem')

    useEffect(() => {
        // getAllProblems()
        getProblemSubset(0, 50)
        console.log('Outputting problems getSubset')
    }, [getAllProblems, getProblemSubset])

    const handleChange = (event) => {
        // TODO: Set this up so it triggers auto-submit after say, 3sec of no change
        console.log('Calling handle change')
        setSearchTerm(event.target.value)
    }

    const handleSubmit = (event) => {
        console.log('calling handle submit')
        event.preventDefault()

    }

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
            <form>
                <label>
                    Search for a problem:
                    <input type="text" name="name" value={searchTerm} onChange={handleChange}/>
                </label>
                <input type="submit" value="Submit" onSubmit={handleSubmit}/>
            </form>
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
        getProblemSubset: (start, end) => dispatch(problemActions.problemsGetSome(start, end))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProblemViewer)
