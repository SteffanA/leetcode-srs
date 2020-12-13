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
                            <div className='flex'>
                                <span className='box-border w-16 border-1 border-black'><Timer.Hours /> hours</span>
                                <span className='box-border w-20'><Timer.Minutes /> minutes</span>
                                <span className='box-border w-24'><Timer.Seconds /> seconds</span>
                            </div>
                            <div className='flex'>
                                <button onClick={start}
                                className='shadow w-16 block border-blue-600 border-2 rounded-full focus:outline-none focus:border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                                >Start</button>
                                <button onClick={pause}
                                className='shadow w-16 block border-blue-600 border-2 rounded-full focus:outline-none focus:border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                                >Pause</button>
                                <button onClick={resume}
                                className='shadow w-20 block border-blue-600 border-2 rounded-full focus:outline-none focus:border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                                >Resume</button>
                                <button onClick={reset}
                                className='shadow w-16 block border-blue-600 border-2 rounded-full focus:outline-none focus:border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                                >Reset</button>
                            </div>
                        </Fragment>
                    )
                }}
            </Timer>
        </div>
    )
}

export default TimerBox