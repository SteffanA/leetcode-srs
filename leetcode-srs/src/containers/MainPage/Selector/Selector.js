import React, {useEffect}  from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import DropDownMenu from '../../SharedItems/DropDownMenu'
import * as listActions from '../../../store/actions/lists'
import * as problemActions from '../../../store/actions/problems'


/*
This component allows the user to:

Select a list from a drop down menu of lists associated with them
Select a problem from the above selected-list
*/
const Selector = props => {
    // Destructure props when neccessary
    const {
        auth,
        curList,
        curListName,
        lists,
        getLists,
        problems,
        getProblems,
        curProblemName
    } = props

    // When this component mounts, try to get the lists
    useEffect(() => {
        // Update the lists if we haven't already got them
        if (auth && !lists) {
            getLists()
            console.log('got lists')
        }
        // TODO: Is this going to work? We can't add curList as dep since
        // then we'll constantly refresh this useEffect I think. Need to re-test
        if (curListName) {
            getProblems(curList)
            console.log('Got problems for list')
        }
        console.log('Updating selector')
    }, [auth, lists, getLists, curListName, getProblems, curProblemName])

// JSX Elements
    let listItems = null

    // If we're authenticated, we should display
    // the user's lists and problems for list
    // in a seperate drop down menu for each.
    if (lists) {
        listItems = lists.map((list) => {
            return {name: list.name, id: list._id}
        })
    }
    
    let listTitle = 'No Lists'
    if (curListName) {
        listTitle = curListName
    }

    // If we have a list selected, we should have a drop down for
    // displaying all the problems under the list. 
    let problemItems = null
    if (problems) {
        problemItems = problems.map((problem) => {
            return {name: problem.name, id: problem._id}
        })
    }

    let problemTitle = 'No Problems'
    if (curProblemName) {
        problemTitle = curProblemName
    }

    return (
        <div>
            <DropDownMenu items={listItems} title={listTitle}/>
            <DropDownMenu items={problemItems} title={problemTitle}/>
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
        loading: state.lists.loading, // TODO: Needed?
        error: state.lists.error,
        auth: state.auth.token !== null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getLists: () => dispatch(listActions.listsGetAll()),
        getProblems: (list) => dispatch(problemActions.problemsGetAllForList(list)),
        // updateProblem: (problemId) => dispatch(actions.updateCurProblem(problemId)),
    }
}


Selector.propTypes = {
    auth: PropTypes.bool.isRequired,
    getLists: PropTypes.func.isRequired,
    setCurrentList: PropTypes.func.isRequired,
    curListName: PropTypes.string,
    curList: PropTypes.object,
    curProblem: PropTypes.object,
    curProblemName: PropTypes.string,
    problems: PropTypes.object,
    getProblems: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
