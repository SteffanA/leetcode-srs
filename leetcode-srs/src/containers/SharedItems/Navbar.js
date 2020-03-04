import React from 'react'
import {NavLink} from 'react-router-dom'
import PropTypes from 'prop-types'
import classes from './Navbar.module.css'
import {connect} from 'react-redux'

/*
need links to:
    Main page
    Login/Logout
    Register (combine with login)
    Edit
    History
*/
// TODO: The auth workflow is a bit messed up - use the login/logout button to test
const Navbar = props => {
    return (
        <div className={classes.Navbar}>
            <div className={classes.Left}>
                <div className={classes.NavLink}>Settings</div>
                {/* Link to settings modal*/}
                <div className={classes.NavLink}>Pick List</div>
                {/* A pick list object under ^ */}
            </div>
            <div className={classes.Center}>
                <NavLink to='/' className={classes.Title}>
                    LeetCode SRS
                </NavLink>
                {/* Under title link to next problem*/}
                {/* Under title link to List's create list*/}
            </div>
            <div className={classes.Right}>
                <NavLink activeClassName={classes.active} to={props.isAuth ? '/logout' : '/auth'}>{props.isAuth ? 'Logout' : 'Register/Login'}</NavLink>
                {/* Set CSS so below is ... below the above*/}
                <NavLink className={classes.NavLink} to='/history'>History</NavLink>
            </div> 
            <button >Test button. i should be blue.</button>
        </div>
    )
}

Navbar.propTypes = {
    isAuth: PropTypes.bool.isRequired,
}

const mapStateToProps = state => {
    return {
        isAuth: (state.auth.token !== null),    
    }
}

export default connect(mapStateToProps)(Navbar)