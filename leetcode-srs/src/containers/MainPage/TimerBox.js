import React, {useEffect, useState, Fragment} from 'react'
import Timer from 'react-compound-timer'

// A basic timer that can be pasued/reset/started and may pass the
// time information up to the parent via props
const TimerBox = (props) => {
    // Deconstruct the props
    const {
        updateTime, // Passes cur time back to main component
        updateState, // Passes curState back to main component
        initialTime, // set the initial time of the box
        start, // bool - set true to start timer immediately
    } = props


    // Store the current time and pass it back to the parent
    // every time this prop updates (default 1s)
    const [curTime, setCurTime] = useState(initialTime)
    const [curState, setCurState] = useState()
    useEffect(() => {
        updateTime(curTime)
        updateState(curState)
    }, [curTime, updateTime, curState, updateState])


    return (
        <div name="TimerBox">
            <Timer startImmediately={start}
            initialTime={initialTime}>
                {({ start, resume, pause, reset, getTimerState, getTime }) => {
                    setCurTime(getTime())
                    setCurState(getTimerState())
                    return (
                        <Fragment>
                            <div>
                                <Timer.Hours /> hours<br/>
                                <Timer.Minutes /> minutes<br/>
                                <Timer.Seconds /> seconds<br/>
                            </div>
                            <div>
                                <button onClick={start}>Start</button>
                                <button onClick={pause}>Pause</button>
                                <button onClick={resume}>Resume</button>
                                <button onClick={reset}>Reset</button>
                            </div>
                        </Fragment>
                    )
                }}
            </Timer>
        </div>
    )
}

export default TimerBox