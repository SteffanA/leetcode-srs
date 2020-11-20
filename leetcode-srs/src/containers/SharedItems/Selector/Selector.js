import React, {useEffect, useState}  from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import useDeepCompareEffect from 'use-deep-compare-effect'

import DropDownMenu from '../DropDownMenu'
import * as listActions from '../../../store/actions/lists'
import * as problemActions from '../../../store/actions/problems'

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
        listSortFunc,
        problemSortFunc,
        // Props from redux
        auth,
        curList,
        curListName,
        lists,
        getLists,
        problems,
        getProblems,
        curProblemName,
        updateCurList,
        updateCurProblem,

        setProblems,
    } = props

    // When this component mounts, try to get the lists
    useEffect(() => {
        if (showLists && auth && !lists) {
            getLists()
            console.log('got lists')
        }
        console.log('Updating selector')
    }, [showLists, auth, lists, getLists])
    
    useDeepCompareEffect(() => {
        // Helper function for updating sorting our problems
        const sortItems = async () => {
            if (showProblems && problemSortFunc) {
                try {
                    const updatedProblems = await problemSortFunc(problems)
                    setProblems(updatedProblems)
                } catch (error) {
                    console.error('Error updating problems after sorting')
                }
            }
        }
        sortItems()
        console.log('Deep compare for problems')
    }, [problems, setProblems, showProblems])

    // Update our problems whenever the curList changes
    useDeepCompareEffect(() =>{
        if (curList) {
            getProblems(curList)
            console.log('Got problems from use deep')
        }
        console.log('Updated selector from useDeep')
    }, [curList, getProblems])

// JSX Elements
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
        curProblemName: state.problems.curProblemName,
        problems: state.problems.curProblems,
        lists: state.lists.usersLists,
        curList: state.lists.curList,
        curListName: state.lists.curListName,
        error: state.lists.error,
        auth: state.auth.token !== null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getLists: () => dispatch(listActions.listsGetAll()),
        getProblems: (list) => dispatch(problemActions.problemsGetAllForList(list)),
        updateCurList: (list) => dispatch(listActions.listSetCurrent(list)),
        updateCurProblem: (problem) => dispatch(problemActions.problemSetCurrent(problem)),
        setProblems: (problems) => dispatch(problemActions.problemSetProblems(problems)),
    }
}


Selector.propTypes = {
    auth: PropTypes.bool.isRequired,
    getLists: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    updateCurList: PropTypes.func.isRequired,
    curListName: PropTypes.string,
    curList: PropTypes.object,
    curProblem: PropTypes.object,
    curProblemName: PropTypes.string,
    problems: PropTypes.array,
    getProblems: PropTypes.func.isRequired,
    listSortFunc: PropTypes.func,
    problemSortFunc: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
