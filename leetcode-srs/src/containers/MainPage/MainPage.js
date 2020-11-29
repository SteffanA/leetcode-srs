import React, {useState, useEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import classes from './MainPage.module.css'
import { connect } from 'react-redux'
// import Prism from 'prismjs'

import {createLink, checkValidity, updateObject} from '../../shared/utility'
import Selector from '../SharedItems/Selector/Selector'
import Button from '../UI/Button/Button'
import Input from '../UI/Input/Input'
import TimerBox from './TimerBox'

import * as subAPI from '../../shared/api_calls/submissions'
import * as statusAPI from '../../shared/api_calls/problemStatuses'

import * as problemActions from '../../store/actions/problems'

/*
Main Page is made of 3 main components:
    a Form where you can submit a Submission into a DB for a problem
    a list selector box where you can select the list to do, and select your next problem
        Either select problem via 'start next' button or hand pick
*/
const MainPage = (props) => {
// Hooks and variables
    // Deconstruct our props
    const {
        curProblem,
        problems,
        isAuth,
        setTON,
    } = props

    // State used to determine if the form/timer elements are visible
    const [elements, setelements] = useState({
        formVisible: false,
        timerVisible: false,
    })

    // Deconstruct the visibility states
    const {
        formVisible,
        timerVisible,
    } = elements

    const [subState, setSubState] = useState({
        // Controls for the submission form
        controls: {
            // Recorded submission
            code: {
                elementType: 'textareapython',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Submitted Code'
                },
                value: '',
                valid: true,
                touched: false,
            },
            // Result (pass or fail)
            result: {
                elementType: 'select',
                elementConfig: {
                    type: 'bool',
                    options: [
                        {
                            value: true,
                            displayValue: 'Success',
                        },
                        {
                            value: false,
                            displayValue: 'Unsuccessful',
                        }
                    ]
                },
                value: true,
                validation: {
                    required: true,
                },
                valid: true,
                touched: false,
            },
            // Reported memory used
            memUsed: {
                elementType: 'input',
                elementConfig: {
                    type: 'number',
                    placeholder: 'Memory Used (reported by LC)',
                },
                value: '',
                //Validation intentionally missing for now
                valid: true,
                touched: false,
            },
            // Reported execution time
            execTime: {
                elementType: 'input',
                elementConfig: {
                    type: 'number',
                    placeholder: 'Execution Time (reported by LC)'
                },
                value: '',
                // Validation intentionally missing for now
                valid: true,
                touched: false,
            },
            // Time spent on submission
            timeSpent: {
                elementType: 'input',
                elementConfig: {
                    type: 'number',
                    placeholder: 'Time Spent (in seconds) - Required'
                },
                value: '',
                validation: {
                    required: true,
                },
                valid: false,
                touched: false,
            }
        },
        formValid : false,
    })

    const {
        controls,
        formValid,
    } = subState

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

    // Store our currentProblemStub such that it persists
    const currentProblemLink = useRef('')


    // Update the problem stub whenever the curProblem changes
    useEffect(() => {
        if (curProblem) {
            currentProblemLink.current = createLink(curProblem.link)
        }
    }, [curProblem])

    // Load the prism-live script
    // useEffect(() => {
    //     let scripts = [
    //         {src : 'prism-live.js?load=python'}
    //     ]

    //     scripts.map(item => {
    //         const script = document.createElement("script")
    //         script.src = item.src
    //         script.async = true
    //         document.body.appendChild(script)
    //     })
    // })

    
// Handler functions
    // Handle a generic form submission
    const submitHandler = async (event) => {
        event.preventDefault() // Prevent a page reload
        // Deconstruct our controls
        const {
            code,
            result,
            memUsed,
            execTime,
            timeSpent,
        } = controls

        const submission = {
            "text": code.value,
            "result": result.value,
            "mem_used": memUsed.value,
            "execution_time": execTime.value,
            "time_spent": timeSpent.value,
        }

        // Call our submit handler
        try {
            await subAPI.addNewSubmission(submission, curProblem.id)
            alert('Problem successfully submitted!')
            // We need to update our problems for the list in our redux to
            // reflect the new problem states
            const probIds = problems.map(prob => prob._id)
            const probTON = await statusAPI.getProblemToNextSubTime(probIds)
            setTON(probTON)
            // Now refresh the page - this seems a bit hacky, but it works.
            window.open(process.env.REACT_APP_HOST_URL, "_self")
        } catch (error) {
            console.error('Error submitting:')
            console.error(error)
            alert('Unable to process submission, please try later.')
        }
    }

    // Handle an input change on a form object
    const inputChangedHandler = (event, controlKey) => {
        // Update the control linked to the control key
        const updatedControl = updateObject(controls[controlKey], {
            // Update the value
            value: event.target.value,
            // Check if validity changes
            valid:checkValidity(event.target.value, controls[controlKey].validation),
            // Note that the element has now been touched
            touched: true,
        })
        //Attach updated control to our original control
        const updatedControls = controls
        updatedControls[controlKey] = updatedControl
        
        let formIsValid = true
        for (let input in updatedControls) {
            formIsValid &= updatedControls[input].valid
        }
        // Update our state
        setSubState({...subState, updatedControls, formValid: !!(formIsValid)})

    }
    // Show our timer and submission form when the problem is opened.
    // The timer will start automatically
    const openProblemHandler = (event) => {
        // Open the link to the problem
        window.open(currentProblemLink.current, "_blank")
        // Show the form and the timer box
        setelements({...elements, formVisible: true, timerVisible: true})
    }

    // Change the timer from hidden to visible or vice versa depending on the
    // current state
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

    // Places the time from our timer into the form
    const importTimeToForm = () => {
        // Update the control linked to the control key
        const updatedControl = updateObject(controls['timeSpent'], {
            // Update the value
            value: Math.floor(curTime/1000),
            // Note that the element has now been touched
            touched: true,
            valid: true,
        })
        //Attach updated control to our original control
        const updatedControls = controls
        updatedControls['timeSpent'] = updatedControl
        
        // Update our state
        setSubState({...subState, updatedControls, formValid : true})
        // Stop our timer - doing this in a cheaty way by hiding the element
        // and setting the state to 'paused'
        setCurState('PAUSED')
        setStoppedTime(0)
        setelements({...elements, timerVisible: false})
    }

// JSX

    // Our form for the problem submission
    let form = null
    // Setup each element of the form
    const formElements = []
    for (let key in controls) {
        formElements.push({
            id: key,
            config: controls[key]
        })
    }
    // Create the form when form is visible
    if (formVisible) {
        const inputs = formElements.map(formEl => (
                    <Input
                        key = {formEl.id}
                        elementConfig = {formEl.config.elementConfig}
                        elementType = {formEl.config.elementType}
                        value = {formEl.config.value}
                        invalid = {!formEl.config.valid}
                        shouldValidate = {formEl.config.validation}
                        touched = {formEl.config.touched}
                        changed={(event) => inputChangedHandler(event, formEl.id)}
                    />
                ))
        form = (<div name="resultForm">
                    {inputs}
                </div>)
    }

    // Button to determine visibility of the timer
    const timerVisButton = (
    <Button btnType='Success' clicked={showHideTimer}>
        {timerVisible && 'Hide Timer'}{!timerVisible && 'Show Timer'}
    </Button>
    )

    // Button to call 'time' on a problem, and import our time into the form'
    const importTimeToFormButton = (
    <Button btnType='Success' clicked={importTimeToForm}>
        Finish Recording Time
    </Button>
    )

    // Button for submitting our form to send this Submission to the server
    // TODO: The disabled property doesn't seem to be working as intended here - snuck around it for now
    const submitResultsButton = (
        <Button clicked={submitHandler} disabled={!formValid} btnType="Success">Submit Result</Button>
    )
    
    // Button to open the link to the currently selected problem
    const problemLinkButton = (
        <Button clicked={openProblemHandler} disabled={false} btnType="Success">Start Problem</Button>
    )

    return (
        <div className={classes.MainPage}>
            {isAuth && <Selector showLists={true} showProblems={true} />}
            {formVisible && form}
            {(!formVisible && isAuth && curProblem) && problemLinkButton}
            <br/>
            <div>
                {timerVisible && timer.current}
                <br/>
                {formVisible && timerVisButton} {timerVisible && importTimeToFormButton}
            </div>
            {(formValid && formVisible) && submitResultsButton}
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        curProblem: state.problems.curProblem, // currently selected problem
        problems: state.problems.curProblems,
        curList: state.lists.curList, // currently selected list
        isAuth: state.auth.token !== null,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setTON: (tonObj) => dispatch(problemActions.problemsSetTimeToNextSubmissions(tonObj)),
    }
}

MainPage.propTypes = {
    curProblem: PropTypes.object,
    curList: PropTypes.object,
    isAuth: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(MainPage)