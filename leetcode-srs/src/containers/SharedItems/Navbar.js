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
const Navbar = props => {
    // useEffect(() => {
    //     console.log('isAUth ', props.isAuth)
    // }, [])
    return (
        <div className={classes.Navbar}>
            <div className={classes.Left}>
                {/* Link to settings modal*/}
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
        </div>
    )
}

Navbar.propTypes = {
    isAuth: PropTypes.bool.isRequired,
}

const mapStateToProps = state => {
    return {
        // TODO: Fix this. This shouldn't work but is currently
        isAuth: (state.isAuth === null),    
    }
}

export default connect(mapStateToProps)(Navbar)