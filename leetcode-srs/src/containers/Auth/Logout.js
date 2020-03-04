import React, {useEffect} from 'react'
import {Redirect} from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import * as actions from '../../store/actions/auth'

// This container exists just to logout a user when they click logout
const Logout = props => {
    // Run logout once
    useEffect(() => {
        props.logout()
    }, [])

    // Redirect user back to home page.
    return (
        <div>
            <Redirect to="/"/>
        </div>
    )
}

Logout.propTypes = {
    logout: PropTypes.func.isRequired,
}

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(actions.logout())
    }
}

export default connect(null, mapDispatchToProps)(Logout)
