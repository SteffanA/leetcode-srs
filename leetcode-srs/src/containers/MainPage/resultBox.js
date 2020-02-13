import React from 'react'
import classes from './ResultBox.module.css'
import PropTypes from 'prop-types'

/*
The function of this is to simply have a box showing two options

Accepted
Incorrect

The user clicks one option, and on click:
    The problem's data is updated

    Option for auto-start next problem?
*/
const ResultBox = props => {

    const acceptedClickHandler = (event) => {
        event.preventDefault()
        console.log('Correct')
    }
    
    const incorrectClickHandler = (event) => {
        event.preventDefault()
        console.log('incorrect')
    }
    
    return (
        <div className={classes.ResultBox}>
            <button onClick={acceptedClickHandler}>Accepted</button>
            <button onClick={incorrectClickHandler}>Accepted</button>
        </div>
    )
}

ResultBox.propTypes = {

}

export default ResultBox
