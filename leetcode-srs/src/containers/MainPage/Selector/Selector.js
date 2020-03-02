import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import DropDownMenu from '../../SharedItems/DropDownMenu'
// import * as actions from '../../store/actions/listandproblems'


/*
This component allows the user to:

Select a list from a drop down menu of lists associated with them
Select a problem from the above selected-list
*/
const Selector = props => {

// JSX Elements
    let menuItems = null

    // If we're authenticated, we should display
    // the user's lists and problems for list
    // in a seperate drop down menu for each.
    if (props.auth) {
        // TODO: This is tets code; replace with real stuff
        menuItems = [ 
            'problem 1',
            'problem 2',
            'problem 3'
        ]
    }

    return (
        <div>
            <DropDownMenu items={menuItems} title='Test'/>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        problem: state.curProblem,
        list: state.curList,
        auth: state.auth.token === null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // updateList: (listId) => dispatch(actions.updateCurList(listId)),
        // updateProblem: (problemId) => dispatch(actions.updateCurProblem(problemId)),
    }
}


Selector.propTypes = {
    auth: PropTypes.bool.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
