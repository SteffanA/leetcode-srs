import React, {useEffect}  from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import DropDownMenu from '../../SharedItems/DropDownMenu'
import * as listActions from '../../../store/actions/lists'


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
        getLists
    } = props

    // When this component mounts, try to get the lists
    useEffect(() => {
        // Update the lists if we haven't already got them
        if (auth && !lists) {
            getLists()
            console.log('got lists')
        }
        console.log('Updating selector')
    }, [auth, lists, getLists, curListName])

// JSX Elements
    let listItems = null

    // If we're authenticated, we should display
    // the user's lists and problems for list
    // in a seperate drop down menu for each.
    if (props.lists) {
        listItems = props.lists.map((list) => {
            return {name: list.name, id: list._id}
        })
    }
    
    let listTitle = 'No Lists'
    if (props.curListName) {
        listTitle = props.curListName
    }

    // If we have a list selected, we should have a drop down for
    // displaying all the problems under the list. 
    let problemItems = null
    if (props.problems) {
        // 
    }

    let problemTitle = 'No Problems'
    if (props.curProblemName) {

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
        // problem: state.problems.curProblem,
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
        // updateProblem: (problemId) => dispatch(actions.updateCurProblem(problemId)),
    }
}


Selector.propTypes = {
    auth: PropTypes.bool.isRequired,
    getLists: PropTypes.func.isRequired,
    setCurrentList: PropTypes.func.isRequired,
    curListName: PropTypes.string.isRequired,
    curList: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
