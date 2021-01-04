import React, {useState, useEffect, Fragment} from 'react'
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
    // State for the help/how-to-use modal
    const [helpOpen, setHelpOpen] = useState(false)

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

    // Open/Close How-To-Use modal
    const openHelp = (event) => {
        event.preventDefault()
        setHelpOpen(true)
    }
    const closeHelp = () => {
        setHelpOpen(false)
    }

    // JSX

    const helpText = (
        <div className='text-center'>
            <p><strong>How to Use</strong></p>
            <ul>
            <li>First, make an account by clicking the login/register page on the navigation bar.</li>
            </ul>
            <p>You will be redirected to the main page, where you will be prompted to visit the manage lists page, which you can access from the prompt or by selecting Manage Lists in the navigation bar.</p>
            <ul>
            <li>From here, create a new list, which is private by default (explained below).</li>
            </ul>
            <p>Your new list will auto-populate in the drop-down list selector, and new options will appear - the ability to edit your list, change the name, or set public (if created as a private list).</p>
            <ul>
            <li><p>Select Edit List, and the list editor will appear, where you can add/remove problems from your list.  By default, the first 50 LeetCode problems are shown, but you can search for problems based on their title.  Once you have added problems, click the Save Changes button.</p>
            </li>
            <li><p>After your changes have been saved, return to the main page by clicking the &#39;LeetCode SRS&#39; title on the top of the page, in the center of the navbar.</p>
            </li>
            </ul>
            <p>Two drop downs will appear - one for your lists, and one for the problems in your selected list.</p>
            <ul>
            <li><p>Problems in the drop down list will be color-coded based on when you should do them - problems &quot;due&quot; within the next 3 days are red, within the next week yellow, and after a week in green.</p>
            </li>
            <li><p>After you have selected the problem you wish to attempt, click Start Problem.</p>
            </li>
            <li><p>A LeetCode link will appear, and as that page loads, a form and a timer will also appear on the LeetCodeSRS site.  Once you complete your LeetCode problem, fill in the form with the results of your submission - whether you were successful or not, what your submitted code was, LeetCode&#39;s reported memory used and execution time, and the time you spent doing the problem.  The time spent can be auto-filled based on the state of the timer - click the &quot;Finish Recording&quot; button and the current time shown is auto-filled into the form.  If this sounds like too much work for you, don&#39;t worry - the only two fields required are the time spent and if you were successful or not.</p>
            </li>
            <li><p>After you&#39;ve filled the form to your satisfaction, click Submit, and the page will refresh, and the next problem to do will be automatically selected in the problem drop-down.</p>
            </li>
            <li><p>After you have attempted some problems, you can go back and view your submissions for the problems you have done by visiting the &quot;Submission History&quot; link in the navbar. Once here, all problems that you have attempted (between all your lists) are presented, and you may view your submission results in table format, including your submitted code.</p>
            </li>
            </ul>
            <p>One final feature to note is that of public versus private lists - public lists are, as the name implies, public - anyone can see the list by name, and the problems contained within them.  They may only be edited by you, but a public list cannot be set back to private.  All public lists are visible via the &#39;View Public Lists&#39; link on the navbar.  There, in addition to viewing the lists, users may also clone the list in its current state to their collection of private lists, where the user may edit it as they please.</p>
        </div>
    )

    const helpModal = (
        <Fragment>
            <Button btnType="Success" clicked={openHelp}>How-to-Use</Button>
            <Modal
                isOpen={helpOpen}
                onAfterOpen={null}
                onRequestClose={closeHelp}
                contentLabel="Help Modal"
            >
                <div>
                    <Button btnType="Success" clicked={closeHelp}>Back to Home</Button>
                </div>
                {helpText}
            </Modal>
        </Fragment>
    )

    return (
        <div className={classes.Navbar}>
            <div className={classes.Left}>
                {helpModal}
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