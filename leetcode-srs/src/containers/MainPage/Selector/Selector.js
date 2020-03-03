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
        getLists
    } = props

    // When this component mounts, try to get the lists
    useEffect(() => {
        if (auth) {
            getLists()
            console.log('got lists')
        }
    }, [auth, getLists])

// JSX Elements
    let menuItems = null

    // If we're authenticated, we should display
    // the user's lists and problems for list
    // in a seperate drop down menu for each.
    if (props.lists) {
        menuItems = props.lists.map((list) => {
            return {name: list.name, id: list._id}
        })
    }
    
    let title = 'No Lists'
    if (props.curList) {
        title = props.curList
    }

    return (
        <div>
            <DropDownMenu items={menuItems} title={title.name}/>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        // problem: state.problems.curProblem,
        lists: state.lists.usersLists,
        curList: state.lists.curList,
        loading: state.lists.loading, // TODO: Needed?
        error: state.lists.error,
        auth: state.auth.token !== null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getLists: () => dispatch(listActions.listGetAll()),
        setCurrentList: (id) => dispatch(listActions.listSetCurrent(id)),
        // updateProblem: (problemId) => dispatch(actions.updateCurProblem(problemId)),
    }
}


Selector.propTypes = {
    auth: PropTypes.bool.isRequired,
    getLists: PropTypes.func.isRequired,
    setCurrentList: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
