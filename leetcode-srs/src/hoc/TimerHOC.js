import React from 'react'
import Timer from 'react-compound-timer'

const withTimer = timerProps => WrappedComponent => wrappedComponentProps => (
  <Timer {...timerProps}>
    {timerRenderProps =>
      <WrappedComponent {...wrappedComponentProps} timer={timerRenderProps} />}
  </Timer>
);

// export const TimerWrapper = (props) => {
//     shouldComponentUpdate() {
//         return false
//     }

//     return (
//         <div>
//             <Timer.Consumer>

//             </Timer.Consumer>
//         </div>
//     )
// }
class TimerWrapper extends React.Component {
    shouldComponentUpdate() {
        return false;
    }

    getTime = () => {
        return this.props.timer.getTime()
    }

    render() {
        return (
            <div>
                <div>Simple text</div>
                <Timer.Consumer>
                    {() => this.props.timer.getTime()}
                </Timer.Consumer>
            </div>
        );
    }
}

const TimerHOC = withTimer({
    initialTime: 5000,
})(TimerWrapper);

export default TimerHOC