import React, {useEffect} from 'react'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import classes from './ProblemTitleBox.module.css'

/*
This component has the following functions:

Display a iFrame pointing to LeetCode
    Should be direct link to whatever problem was selected

Some quick notes:
    "question__title_slug" is the url at the end of https://leetcome.com/problems/
*/
const ProblemTitleBox = (props) => {
    useEffect(() => {
        console.log("Test")
    }, [])

    //TODO: Replace the second part of link with some info
    const link = 'https://leetcode.com/problems/' + 'minimum-number-of-steps-to-make-two-strings-anagram/'

    const openProblemHandler = (event) => {
        //TODO: Start the timer object's timer here.
        // Thoughts on the flow:
        /*
            Set some 'problem started' redux state
            Use said state to refresh main page to include timer
            Include result box

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
        <div className={classes.ProblemTitleBox}>
            <strong>Welcome</strong>
            <a href={link} target='_blank' onClick={openProblemHandler}>Start Problem</a>
        </div>
    )
}

ProblemTitleBox.propTypes = {

}

export default ProblemTitleBox