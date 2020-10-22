import React, { Component, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as problemActions from '../../store/actions/problems'
import classes from './ProblemViewer.module.css'
import Input from '../UI/Input/Input'
import Button from '../UI/Button/Button'


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

    // Map the difficulty of a problem from a number to a String
    const difficultyMapping = {
        '1' : 'Easy',
        '2' : 'Medium',
        '3' : 'Hard'
    }

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

    const createLink = (stub) => {
        return 'https://leetcode.com/problems/' + stub
    }

    const addProblemToList = (id) => {
        console.log('Adding problem with id ' + id + ' to list')
        return
    }

    const cur_prob_button = (id) => {
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
        probs = problems.map(prob => {
            return (
                <tr key={prob._id}>
                    <td> 
                        {prob.id} 
                    </td>
                    <td>
                        <a href={createLink(prob.link)}>{prob.name}</a>
                    </td>
                    <td>
                        <b>{difficultyMapping[prob.difficulty]}</b>
                    </td>
                    <td>
                        {prob.problem_text}
                    </td>
                    <td>
                        {cur_prob_button(prob._id)}
                    </td>
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
                    <input type="text" name="name" value={searchTerm} onChange={handleChange}/>
                </label>
                <input type="submit" value="Submit" onSubmit={handleSubmit}/>
            </form>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Problem</th>
                    <th>Difficulty</th>
                    <th>Problem Text</th>
                    <th>Add to Current List</th>
                </tr>
                {probs}
            </table>
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
