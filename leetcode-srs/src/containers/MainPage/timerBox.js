import React, {useEffect, useState, Fragment} from 'react'
import Timer from 'react-compound-timer'

const TimerBox = (props) => {
    // Deconstruct the props
    const {
        updateTime, // Passes cur time back to main component
        initialTime, // set the initial time of the box
    } = props


    // Store the current time and pass it back to the parent
    // every time this prop updates (default 1s)
    const [curTime, setCurTime] = useState(initialTime)
    useEffect(() => {
        updateTime(curTime)
    }, [curTime, updateTime])


    return (
        <div name="TimerBox">
            <Timer startImmediately={true}
            initialTime={initialTime}
            onStart={() => console.log('onStart hook')}
            onResume={() => console.log('onResume hook')}
            onPause={() => console.log('onPause hook')}
            onStop={() => console.log('onStop hook')}
            onReset={() => console.log('onReset hook')}>
                {({ start, resume, pause, reset, getTimerState, getTime }) => {
                    setCurTime(getTime())
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