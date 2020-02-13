import React from 'react'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import classes from './Navbar.module.css'

/*
need links to:
    Main page
    Login/Logout
    Register (combine with login)
    Edit
    History
*/
const Navbar = props => {
    //TODO: Replace with props when auth setup
    let isAuth = false
    return (
        <div className={classes.Navbar}>
            <Link className={classes.Link} to='/'>Main Page</Link>
            <Link className={classes.Link} to={isAuth ? '/logout' : '/login'}>{isAuth ? 'Logout' : 'Register/Login'}</Link>
            <Link className={classes.Link} to='/edit'>Edit Lists</Link>
            <Link className={classes.Link} to='/history'>Study History</Link>
        </div>
    )
}

Navbar.propTypes = {
}

export default Navbar