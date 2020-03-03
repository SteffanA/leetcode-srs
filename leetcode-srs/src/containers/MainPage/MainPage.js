import React, {useEffect, useState} from 'react'
// import {Link} from 'react-router-dom'
// import PropTypes from 'prop-types'
import classes from './MainPage.module.css'
import { connect } from 'react-redux'

import Selector from './Selector/Selector'
import Button from '../UI/Button/Button'
import Input from '../UI/Input/Input'

/*
Main Page is made of 3 main components:
    a Form where you can submit a Submission into a DB for a problem
    a list selector box where you can select the list to do, and select your next problem
        Either select problem via 'start next' button or hand pick
*/
const MainPage = (props) => {
    // useEffect(() => {
    //     console.log("Test")
    // }, [])

    const [elements, setelements] = useState({
        formVisible: false,
        timerVisible: false,
        currentProblemStub: '',
    })


    const link = 'https://leetcode.com/problems/' // + props.problem
    let form = null

    const openProblemHandler = (event) => {
        // Open the submission form

        // Open the timer box and start the timer
        console.log('Problem started')
    }

    const updateProblem = () => {
        // We need to grab the next problem from the list and:
        /*
        Update the link
        Close the form
        Close the timer
        Reset our timer and form (depending on how we deal w/ closing)
        */
    }

    return (
        <div className={classes.MainPage}>
            <Selector/>
            
            <a href={link} target='_blank' rel="noopener noreferrer" onClick={openProblemHandler}>Start Problem</a>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        curProblem: state.curProblem, // currently selected problem
        curList: state.curList, // currently selected list
    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

MainPage.propTypes = {

}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage)