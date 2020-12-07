import React from 'react'
import PropTypes from 'prop-types'
import {createLink} from '../../../shared/utility'
import Spinner from '../../UI/Spinner/Spinner'


// Creates a generic table for visualizing problems
// Contains standard fields, id, name, difficulty, problem text
// Allows for the passing of additional custom fields to append as new columns
export const ProblemTable = (props) => {

    const {
        problems, //problems to insert into the table
        extraFields, // Explained below
        loading, // if table info is still loading
    } = props
    /*
    Extra fields is an array of mappings containing the following: 
    {
        title: <String title of the column>
        generator: <function that generates the cell output when provided a problem>
    }
    */
    
    // Map the difficulty of a problem from a number to a String
    const difficultyMapping = {
        '1' : 'Easy',
        '2' : 'Medium',
        '3' : 'Hard'
    }
    
    let probs = null
    if (!loading && problems) {
        probs = problems.map(prob => {
            // Generate additional table columns for all the extra fields to append
            let extras = null
            if (extraFields) {
                extras = extraFields.map(field => {
                    return (
                        <td>{field['generator'](prob)}</td>
                    )
                })
            }

            // Generate the base attributes and add any extra fields if they exist
            return (
                <tr key={prob._id}>
                    <td> {prob.id} </td>
                    <td><a href={createLink(prob.link)} target="_blank">{prob.name}</a></td>
                    <td><b>{difficultyMapping[prob.difficulty]}</b></td>
                    <td>{prob.problem_text}</td>
                    {extras}
                </tr>
            )
            }

        )
    }
    
    let extraTitles = null
    if (!loading && extraFields) {
        extraTitles = extraFields.map(field => {
            return (
                <th key={field['title']}>{field['title']}</th>
            )
        })
    }
    let titles = (
        <tr>
            <th key='id'>ID</th>
            <th key='problem'>Problem</th>
            <th key='difficulty'>Difficulty</th>
            <th key='problem_text'>Problem Text</th>
            {extraTitles}
        </tr>
    )

    return (
        <div>
            {!loading && (
            <table>
                <tbody>
                    {titles}
                    {probs}
                </tbody>
            </table>
            )}
            {loading && <Spinner/>}
        </div>
    )
}

ProblemTable.propTypes = {
    problems: PropTypes.array,
    extraFields: PropTypes.array,
}

export default ProblemTable
