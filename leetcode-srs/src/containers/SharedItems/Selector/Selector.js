import React, {useEffect, useState}  from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import useDeepCompareEffect from 'use-deep-compare-effect'
import deepEqual from 'deep-equal'

import DropDownMenu from '../DropDownMenu'
import * as listActions from '../../../store/actions/lists'
import * as problemActions from '../../../store/actions/problems'
import { addDaysToDate } from '../../../shared/utility'

/*
TODO: Instead of using showLists/showProblems,
should generize this, and pass props to handle whatever data type
we actually want/need

So basically using it as a wrapper for the DropDownMenu? Just handling the sort?
Not sure if we even need this
/*
This component allows the user to:

Select a list from a drop down menu of lists associated with them
Select a problem from the above selected-list
*/
const Selector = props => {
    // Destructure props when neccessary
    const {
        // Passed props
        showLists,
        showProblems,
        // Props from redux
        auth,
        curList,
        lists,
        getLists,
        problems,
        getProblemsSorted,
        updateCurList,
        updateCurProblem,
        probsTTN,
        setProblems,
    } = props

    // When this component mounts, try to get the lists
    useEffect(() => {
        if (showLists && auth && !lists) {
            getLists()
        }
        console.log('Lists UseEffect ran')
    }, [showLists, auth, lists])

    useEffect(() => {
        if (showProblems && problems && probsTTN) {
            // Add the color field to the problems based on the TTN
            const now = new Date(Date.now())
            const problem_copy = Object.assign(problems)
            for (let prob of problem_copy) {
                const ttn = probsTTN[prob._id]
                if (ttn) {
                    const ttnAsDate = new Date(ttn)
                    let color = 'green'
                    console.log(ttnAsDate)
                    if (ttnAsDate < addDaysToDate(now, 3)) {
                        color = 'red'
                    }
                    else if (ttnAsDate < addDaysToDate(now, 7)) {
                        color = 'yellow'
                    }
                    prob.color = color
                }
                else {
                    // Assume not done.
                    prob.color = 'red'
                }
            }
            if (!deepEqual(problems, problem_copy)) {
                // TODO: This is causing an infinite loop!
                console.log('not equal :(')
                // NOTE: Only when showProblems (duh)
                // setProblems(problems)
            }
            else {
                console.log('These two are equal :)')
                console.log(problems)
                console.log(problem_copy)
            }
        }
        console.log('Problem UseEffect ran')
    }, [showProblems, problems])

    // Update our problems whenever the curList changes
    useDeepCompareEffect(() =>{
        if (curList) {
            getProblemsSorted(curList)
            // TODO: Maybe just add hacky behavior back for MVP
        }
        console.log('Updated selector from useDeep on curList')
    }, [lists, curList, getProblemsSorted])

// JSX Elements
    console.log('Lists are now:')
    console.log(lists)
    return (
        <div>
            {showLists && <DropDownMenu items={lists} updateCurItem={updateCurList}/>}
            {showProblems &&<DropDownMenu items={problems} updateCurItem={updateCurProblem}/>}
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        curProblem: state.problems.curProblem,
        problems: state.problems.curProblems,
        probsTTN: state.problems.problemIdToTimeToNextSub,
        lists: state.lists.usersLists,
        curList: state.lists.curList,
        error: state.lists.error,
        auth: state.auth.token !== null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getLists: () => dispatch(listActions.listsGetAll()),
        getProblemsSorted: (list) => dispatch(problemActions.problemsGetAllForListSorted(list)),
        setProblems: (problems) => dispatch(problemActions.problemSetProblems(problems)),
        updateCurList: (list) => dispatch(listActions.listSetCurrent(list)),
        updateCurProblem: (problem) => dispatch(problemActions.problemSetCurrent(problem)),
    }
}


Selector.propTypes = {
    auth: PropTypes.bool.isRequired,
    getLists: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    updateCurList: PropTypes.func.isRequired,
    curList: PropTypes.object,
    curProblem: PropTypes.object,
    problems: PropTypes.array,
    getProblemsSorted: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
