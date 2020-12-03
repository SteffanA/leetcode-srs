import React, {useEffect, useState}  from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import useDeepCompareEffect from 'use-deep-compare-effect'

import DropDownMenu from '../DropDownMenu/DropDownMenu'
import * as listActions from '../../../store/actions/lists'
import * as problemActions from '../../../store/actions/problems'

/*
TODO: Instead of using showLists/showProblems,
should generize this, and pass props to handle whatever data type
we actually want/need

So basically using it as a wrapper for the DropDownMenu? Just handling the sort?
Not sure if we even need this
Update: Making this generic would work, and yeah, it basically just becomes a wrapper
for the DropDownMenu at that point. Not a priority.
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
        curProblem,
        getProblemsSorted,
        updateCurList,
        updateCurProblem,
    } = props

    // Add state items so we can update the selector titles quicker
    // than waiting for the redux to update
    const [problemTitleItem, setProblemTitleItem] = useState(null)
    const [listTitleItem, setlistTitleItem] = useState(null)

    // When this component mounts, try to get the lists if we haven't already
    useEffect(() => {
        if (showLists && auth && !lists) {
            // Nullify the list title item until we get lists
            setlistTitleItem(null)
            getLists()
        }
    }, [showLists, auth, lists])

    // Set the title item properties when we update the redux
    useEffect(()=> {
        setProblemTitleItem(curProblem)
        setlistTitleItem(curList)
    }, [curProblem, curList])

    // Update our problems whenever the curList changes
    useDeepCompareEffect(() =>{
        if (curList) {
            // Nullify problem title until we get new problems
            setProblemTitleItem(null)
            getProblemsSorted(curList)
        }
    }, [lists, curList, getProblemsSorted])

// JSX Elements

    // Only display once we have a list
    return (
        <div>
            {showLists && lists && <DropDownMenu items={lists} updateCurItem={updateCurList} titleItem={listTitleItem}/>}
            {showProblems && lists && <DropDownMenu items={problems} updateCurItem={updateCurProblem} titleItem={problemTitleItem}/>}
            {/* If trying to show lists or problems, but no lists exist, prompt user to add.*/}
            {(showLists || showProblems) && !lists && 
            <a href='/manage-lists' style={{color: 'red'}}>
                Lists loading or no lists exist.  If you haven't added a list, add one at the manage lists page.
            </a>
            }
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        curProblem: state.problems.curProblem,
        problems: state.problems.curProblems,
        lists: state.lists.usersLists,
        curList: state.lists.curList,
        error: state.lists.error, // TODO: Use this? Or drop it from map
        auth: state.auth.token !== null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getLists: () => dispatch(listActions.listsGetAll()),
        getProblemsSorted: (list) => dispatch(problemActions.problemsGetAllForListSorted(list)),
        updateCurList: (list) => dispatch(listActions.listSetCurrent(list)),
        updateCurProblem: (problem) => dispatch(problemActions.problemSetCurrent(problem)),
    }
}


Selector.propTypes = {
    auth: PropTypes.bool.isRequired,
    getLists: PropTypes.func.isRequired,
    lists: PropTypes.array,
    updateCurList: PropTypes.func.isRequired,
    curList: PropTypes.object,
    curProblem: PropTypes.object,
    problems: PropTypes.array,
    getProblemsSorted: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
