import React, { } from 'react'
import {createLink} from '../../../shared/utility'

// Creates a generic table for visualizing problems
// Contains standard fields, id, name, difficulty, problem text
// Allows for the passing of additional custom fields to append as new columns
export const ProblemTable = (props) => {

    const {
        problems, //problems to insert into the table
        extraFields, // Explained below
    } = props

    /*
    Extra fields is a mapping containing the following: 
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
    if (problems) {
        console.debug(problems)
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
                    <td><a href={createLink(prob.link)}>{prob.name}</a></td>
                    <td><b>{difficultyMapping[prob.difficulty]}</b></td>
                    <td>{prob.problem_text}</td>
                    {extras}
                </tr>
            )
            }

        )
    }
    
    let extraTitles = null
    if (extraFields) {
        extraTitles = extraFields.map(field => {
            return (
                <th>{field['title']}</th>
            )
        })
    }
    let titles = (
        <tr>
            <th>ID</th>
            <th>Problem</th>
            <th>Difficulty</th>
            <th>Problem Text</th>
            {extraTitles}
        </tr>
    )

    return (
        <div>
            <table>
                <tbody>
                    {titles}
                    {probs}
                </tbody>
            </table>
        </div>
    )
}


export default ProblemTable
