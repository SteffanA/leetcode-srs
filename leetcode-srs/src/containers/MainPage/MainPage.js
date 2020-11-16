import React, {useState, useEffect, useRef, Fragment} from 'react'
// import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import classes from './MainPage.module.css'
import { connect } from 'react-redux'

import {createLink} from '../../shared/utility'
import Timer from 'react-compound-timer'
import Selector from '../SharedItems/Selector/Selector'
import Button from '../UI/Button/Button'
import TimerHOC from '../../hoc/TimerHOC'
import TimerBox from './timerBox'

/*
Main Page is made of 3 main components:
    a Form where you can submit a Submission into a DB for a problem
    a list selector box where you can select the list to do, and select your next problem
        Either select problem via 'start next' button or hand pick
*/
const MainPage = (props) => {
    const [elements, setelements] = useState({
        formVisible: false,
        timerVisible: false,
    })

    // Store our currentProblemStub such that it persists
    const currentProblemLink = useRef('')

    let timerProps = null

    const [curTime, setCurTime] = useState(0)

    // Store the timer object as a ref so we can access the
    // hooks and the current times
    const timer = useRef(
        <TimerBox updateTime={setCurTime} initialTime={curTime}/>
    )

    // Deconstruct the state
    const {
        formVisible,
        timerVisible,
    } = elements

    // Deconstruct our props
    const {
        curProblem
    } = props

    // Update the problem stub whenever the curProblem changes
    useEffect(() => {
        console.log('Updating main page')
        console.log(curProblem)
        if (curProblem) {
            console.log('cur problem and link on main page:')
            console.log(curProblem)
            console.log(curProblem.link)
            currentProblemLink.current = createLink(curProblem.link)
            console.log(currentProblemLink)
        }
    }, [curProblem])

    


    // const link = 'https://leetcode.com/problems/' + currentProblemStub.current
    let form = null

    const openProblemHandler = (event) => {
        // Show the form and the timer box
        setelements({...elements, formVisible: true, timerVisible: true})
        // Start the timer
        console.log('Problem started')
        console.log('curtime:')
        // NOTE: curTime is a count in seconds/1000 => milliseconds
        console.log(curTime)
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

    const showHideTimer = () => {
        if (timerVisible) {
            // We're hiding the timer, so set the initial time...?
            // reset the timerbox ref
            console.log('Hiding timer box')
            timer.current = <TimerBox updateTime={setCurTime} initialTime={curTime}/>
        }
        setelements({...elements, timerVisible: !timerVisible})
    }

    // TODO: Need hide/show to not reset initial time...
    // So store initial time in a state, or maybe a ref? pass to timer
    const timerVisButton = (
    <Button btnType='Success' clicked={showHideTimer}>
        {timerVisible && 'Hide Timer'}{!timerVisible && 'Show Timer'}
    </Button>
    )

    return (
        <div className={classes.MainPage}>
            {props.isAuth && <Selector showLists={true} showProblems={true}/>}
            {formVisible && null}
            {timerVisible && null}
            {props.isAuth && curProblem && <a href={currentProblemLink.current} target='_blank' rel="noopener noreferrer" onClick={openProblemHandler}>Start Problem</a>}
            {timerVisible && timer.current}
            <br/>
            {formVisible && timerVisButton}
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        curProblem: state.problems.curProblem, // currently selected problem
        curList: state.lists.curList, // currently selected list
        isAuth: state.auth.token !== null,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

MainPage.propTypes = {
    curProblem: PropTypes.object,
    curList: PropTypes.object,
    isAuth: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage)