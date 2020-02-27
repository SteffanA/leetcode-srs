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
    return (
        <div className={classes.Navbar}>
            <NavLink to='/'>Main Page</NavLink>
            <NavLink activeClassName={classes.active} to={props.isAuth ? '/logout' : '/auth'}>{props.isAuth ? 'Logout' : 'Register/Login'}</NavLink>
            <NavLink to='/edit'>Edit Lists</NavLink>
            <NavLink className={classes.NavLink} to='/history'>Study History</NavLink>
        </div>
    )
}

Navbar.propTypes = {
    isAuth: PropTypes.bool.isRequired,
}

const mapStateToProps = state => {
    return {
        isAuth: state.isAuth,    
    }
}

export default connect(mapStateToProps)(Navbar)