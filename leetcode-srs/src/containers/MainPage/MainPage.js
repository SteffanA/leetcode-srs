import React, {useEffect} from 'react'
// import {Link} from 'react-router-dom'
// import PropTypes from 'prop-types'
import classes from './MainPage.module.css'
import { connect } from 'react-redux'

/*
Main Page is made of 3 main components:
    a Form where you can submit a Submission into a DB for a problem
    a list selector box where you can select the list to do, and select your next problem
        Either select problem via 'start next' button or hand pick
*/
const MainPage = (props) => {
    useEffect(() => {
        console.log("Test")
    }, [])


    const link = 'https://leetcode.com/problems/' // + props.problem

    const openProblemHandler = (event) => {
        //TODO: Start the timer object's timer here.
        // Thoughts on the flow:
        /*
            Set some 'problem started' redux state
            Use said state to refresh main page to include timer
            Include result box
        This is all nice-to-have, but I should just get the base flow working first
        */
        console.log('Problem started')
    }

    /*
    Thoughts on where this could go now that iframes are out
        - https://github.com/skygragon/leetcode-cli/blob/master/lib/core.js
        - Seeing as there's a CLI version, it seems do-able to split this into a couple aspects:
            1) Show the problem question
            2) Provide a space for test cases
            3) Allow user to hit run
            4) Allow user to hit submit

            On submit, check if success or fail. Stop timer, record result, record the submission, store all
                Store as fail at first, allow manual override. Don't delete anything from page, just setup
            
            This kind of stuff depends a lot on being able to basically re-do the work done in the CLI version.
                Might be able to borrow some code, or worst case use for inspiration on acccessing LC
    */

    return (
        <div className={classes.MainPage}>
            <a href={link} target='_blank' rel="noopener noreferrer" onClick={openProblemHandler}>Start Problem</a>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        problem: state.current_problem,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {

    }
}

MainPage.propTypes = {

}

// export default connect(mapStateToProps, mapDispatchToProps)(MainPage)
export default MainPage