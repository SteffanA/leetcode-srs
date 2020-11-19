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

    const [sortedProblems, setSortedProblems] = useState(problems)
    const [sortedLists, setSortedLists] = useState(lists)
    const [sorted, setSorted] = useState(false)

    // When this component mounts, try to get the lists
    useEffect(() => {
        // Helper function to sort problems/lists
        // if sort function provided
        const sortItems = async () => {
            // Sort the lists if sort function is provided
            if (showLists && listSortFunc  && auth && lists && !sorted) {
                console.debug('sorting lists')
                const updatedLists = await listSortFunc(lists)
                setSortedLists(updatedLists)
            }
            if (showProblems && problemSortFunc && !sorted) {
                console.debug('Sorted problems going from:')
                console.debug(sortedProblems)
                const updatedProblems = await problemSortFunc(problems)
                console.debug('to:')
                console.debug(updatedProblems)
                props.setProblems(updatedProblems)
                // setSortedProblems(updatedProblems)
            }
            setSorted(true)
        }
        // Update sortedProblems and sortedLists now to problems/lists
        // if (showLists) {
        //     console.log('setting lists w/')
        //     console.log(lists)
        //     setSortedLists(lists)
        // }
        // if (showProblems) {
        //     console.log('setting problems w/')
        //     console.log(problems)
        //     setSortedProblems(problems)
        // }
        // Update the lists if we haven't already got them
        if (showLists && auth && !lists) {
            getLists()
            console.log('got lists')
        }
        // This function will actually sort/setSortedX if we need to
        // sortItems()
        console.log('Updating selector')
    }, [auth, lists, getLists, problems, setSortedLists, setSortedProblems, 
        showLists, showProblems, problemSortFunc, listSortFunc])
    
    useDeepCompareEffect(() => {
        const sortItems = async () => {
            if (showProblems && problemSortFunc) {
                console.debug('Sorted problems going from:')
                console.debug(sortedProblems)
                const updatedProblems = await problemSortFunc(problems)
                console.debug('to:')
                console.debug(updatedProblems)
                setProblems(updatedProblems)
                // setSortedProblems(updatedProblems)
            }
            setSorted(true)
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
    let listTitle = 'No Lists'
    if (curListName) {
        listTitle = curListName
    }

    let problemTitle = 'No Problems'
    if (curProblemName) {
        problemTitle = curProblemName
    }

    return (
        <div>
            {showLists && <DropDownMenu items={sortedLists} title={listTitle} updateCurItem={updateCurList}/>}
            {showProblems &&<DropDownMenu items={problems} title={problemTitle} updateCurItem={updateCurProblem}/>}
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
    setCurrentList: PropTypes.func.isRequired,
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
