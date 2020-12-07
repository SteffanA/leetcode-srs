import React, {useState, useEffect} from 'react'
import {NavLink} from 'react-router-dom'
import PropTypes from 'prop-types'
import classes from './Navbar.module.css'
import {connect} from 'react-redux'
import Modal from 'react-modal'
import Auth from '../../Modals/Login/Auth'
import Button from '../../UI/Button/Button'

/*
Provide links to:
    Main page
    Login/Logout
    Register (combine with login)
    Edit
    History
*/
const Navbar = props => {
    // State for the login modal
    const [loginOpen, setLoginOpen] = useState(false)

    // On reload, close Modal if it was open and we auth'd
    useEffect(() => {
        if (props.isAuth) {
            setLoginOpen(false)
        }
    }, [props.isAuth])

    // Open/close login modal
    const openLogin = (event) => {
        event.preventDefault()
        setLoginOpen(true)
    }
    const closeLogin = () => {
        setLoginOpen(false)
    }

    // JSX
    return (
        <div className={classes.Navbar}>
            <div className={classes.Left}>
                <NavLink className={classes.NavLink} to='/view-public-lists'>View Public Lists</NavLink>
            </div>
            <div className={classes.Center}>
                <NavLink to='/' className={classes.Title}>
                    LeetCode SRS
                </NavLink>
                {/* Under title link to next problem*/}
                {/* Under title link to List's create list*/}
                {props.isAuth && <NavLink to='/manage-lists'>Manage {props.user}'s Lists</NavLink>}
            </div>
            <div className={classes.Right}>
                {props.isAuth && <NavLink activeClassName={classes.active} to='/logout'>Logout</NavLink>}
                {!props.isAuth && <Button btnType="Success" clicked={openLogin}>Login/Register</Button>}
                <Modal
                    isOpen={loginOpen}
                    onAfterOpen={null}
                    onRequestClose={closeLogin}
                    contentLabel="Login Modal"
                >
                    <div>
                        <Button btnType="Success" clicked={closeLogin}>Back to Home</Button>
                    </div>
                    <div>
                        <Auth/>
                    </div>
                </Modal>
                {props.isAuth && <NavLink className={classes.NavLink} to='/submissions'>Submission History</NavLink> }
            </div> 
            {/* TODO: Use this to fix css module stuff <button >Test button. i should be blue.</button>*/}

        </div>
    )
}

Navbar.propTypes = {
    isAuth: PropTypes.bool.isRequired,
}

const mapStateToProps = state => {
    return {
        isAuth: (state.auth.token !== null),
        user: state.auth.userId,  
    }
}

export default connect(mapStateToProps)(Navbar)