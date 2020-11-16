import React, {useState, useEffect, useRef, Fragment} from 'react'
// import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import classes from './MainPage.module.css'
import { connect } from 'react-redux'

import {createLink} from '../../shared/utility'
import Timer from 'react-compound-timer'
import Selector from '../SharedItems/Selector/Selector'
import Button from '../UI/Button/Button'
import TimerBox from './TimerBox'

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

    // Store information regarding our timer
    const [stoppedTime, setStoppedTime] = useState()
    const [curTime, setCurTime] = useState(0)
    const [curState, setCurState] = useState()

    // Store the timer object as a ref so we can access the
    // hooks and the current times
    // TODO: Do we actually need this as a ref? Can we just use as an obj?
    const timer = useRef(
        <TimerBox start={true} updateTime={setCurTime} updateState={setCurState} initialTime={curTime}/>
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

    


    let form = null

    // Show our timer and submission form when the problem is opened.
    // The timer will start automatically
    const openProblemHandler = (event) => {
        // Show the form and the timer box
        setelements({...elements, formVisible: true, timerVisible: true})
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
            // We're hiding our timer - we need to set our initial time
            if (curState.localeCompare('PAUSED') === 0) {
                // Do not update the stopped time if the timer is paused or stopped.
                setStoppedTime(0)
            }
            else {
                // Store the current time
                setStoppedTime(new Date())
            }
        }
        else {
            // Exposing timer box again
            let updatedTime = curTime
            let shouldStart = false // init to have timer box not start right away
            if (stoppedTime !== 0) {
                // a 0 stopped time instead of a date means we just use
                // the initial curTime, since the timer was paused/stopped
                // when hidden. Otherwise we calculate elapsed time since hidden
                updatedTime += (new Date() - stoppedTime)
                // since the timer was 'running' in the background, set shouldStart
                // to true
                shouldStart = true 
            }
            // Update our timer reference
            timer.current = <TimerBox start={shouldStart} updateTime={setCurTime} updateState={setCurState} initialTime={updatedTime}/>
        }
        setelements({...elements, timerVisible: !timerVisible})
    }

    // Button to determine visibility of the timer
    const timerVisButton = (
    <Button btnType='Success' clicked={showHideTimer}>
        {timerVisible && 'Hide Timer'}{!timerVisible && 'Show Timer'}
    </Button>
    )

    return (
        <div className={classes.MainPage}>
            {props.isAuth && <Selector showLists={true} showProblems={true}/>}
            {formVisible && null}
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