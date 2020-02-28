import React from 'react'
import { connect } from 'react-redux'
// import * as actions from '../../store/actions/listandproblems'

import PropTypes from 'prop-types'

/*
This component allows the user to:

Select a list from a drop down menu of lists associated with them
Select a problem from the above selected-list
*/
const Selector = props => {
    return (
        <div>
            
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        problem: state.curProblem,
        list: state.curList
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // updateList: (listId) => dispatch(actions.updateCurList(listId)),
        // updateProblem: (problemId) => dispatch(actions.updateCurProblem(problemId)),
    }
}


Selector.propTypes = {
    // TODO: idk if these should just be ids. Or maybe full blown objects
    problem: PropTypes.string,
    list: PropTypes.string,
}

export default connect(mapStateToProps, mapDispatchToProps)(Selector)
