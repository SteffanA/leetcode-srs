import React, {useState} from 'react'
import PropTypes from 'prop-types'
import classes from './Auth.module.css'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import Input from '../UI/Input/Input'
import Button from '../UI/Button/Button'
import Spinner from '../UI/Spinner/Spinner'

import { checkValidity, updateObject } from '../../utility/utility'
import * as actions from '../../store/actions/auth'


const Auth = props => {
// State code
    const [loginState, setLoginState] = useState({
        // Are we registering or logging in?
        isRegister: true,
        // Controls for the login/register form
        controls: {
            // User's email
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Email Address'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true,
                },
                valid: false,
                touched: false,
            },
            // User's password
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Password',
                },
                value: '',
                validation: {
                    required: true,
                    // TODO: Add min length field/other validations?
                },
                valid: false,
                touched: false,
            },
            // Validate user's password (if registering)
            password2: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Confirm Password <Required if registering>',
                },
                value: '',
                //Validation intentionally missing for now
                valid: true,
                touched: false,
            },
            // Username
            name: {
                elementType: 'input',
                elementConfig: {
                    type: 'username',
                    placeholder: 'User Name <Required if registering>'
                },
                value: '',
                // Validation intentionally missing for now
                valid: true,
                touched: false,
            }
        }
    })

    // Deconstruct our state
    const {
        isRegister,
        controls
    } = loginState

// Functions

    // Handle a generic form submission
    const submitHandler = (event) => {
        event.preventDefault() // Prevent a page reload
        // Deconstruct our controls
        const {
            email,
            password,
            password2,
            name
        } = controls

        // If registering: ensure passwords match and a name was provided
        if (isRegister) {
            //TODO: Transform this to somehow use our checkValidity function?
            if (password.value !== password2.value) {
                // TODO - throw an error
                console.log('pass values dont match ' + password.value + password2.value)
                return
            }
            if (name.value === '') {
                console.log('name value is empty')
                // TODO: Throw an error
                return
            }
        }

        // We can use the same function for login and register.
        props.auth(email.value, password.value, isRegister, name.value)
    }

    // Handle an input change on a form object
    const inputChangedHandler = (event, controlKey) => {
        // Update the control linked to the control key
        const updatedControl = updateObject(controls[controlKey], {
            // Update the value
            value: event.target.value,
            // Check if validity changes
            valid:checkValidity(event.target.value, controls[controlKey].validation),
            // Note that the element has now been touched
            touched: true,
        })
        //Attach updated control to our original control
        const updatedControls = controls
        updatedControls[controlKey] = updatedControl
        
        // Update our state
        setLoginState({...loginState, updatedControls})
    }

    // A couple of helper functions to update our isRegister state based on button selected
    const updateToLogin = () => {
        setLoginState({...loginState, isRegister: false})
    }
    const updateToRegister = () => {
        setLoginState({...loginState, isRegister: true})
    }

// JSX elements

    // Setup an error message in the case we have auth error
    let errorMessage = null
    if (props.error) {
        //Output our error message
        //TODO: Is this the right way to access our error message? Check api
        errorMessage = <p>{props.error.message}</p>
    }

    // Make an array with all form elements with a key identifier
    // All form elements come from a control in the state's controls' object
    const formElements = []
    for (let key in controls) {
        formElements.push({
            id: key,
            config: controls[key]
        })    
    }

    // Setup our form
    let form = null
    // If our form is loading, simply display a spinner
    if (props.loading) {
        form = <Spinner/>
    }
    else {
        // Create our form from our form elements
        form = formElements.map(formElement => (
            <Input
                key = {formElement.id}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                invalid={!formElement.config.valid}
                shouldValidate = {formElement.config.validation}
                touched = {formElement.config.touched}
                changed={(event) => inputChangedHandler(event, formElement.id)}
            />
        ))
    }

    let redirect = null
    // Auto-redirect our user to the home page if they're already authenticated
    if (props.isAuth) {
        redirect = <Redirect to='/'/>
    }

// Return output
    // TODO: Does the setting of the state work on our click action?
    // Will the state be set always before submitHandler is executed?
    return (
        <div className={classes.Auth}>
            {redirect}
            {errorMessage}
            <form onSubmit={submitHandler}>
                {form}
                <Button
                btnType="Success"
                clicked={updateToLogin}>
                    Login
                </Button>
                <Button
                btnType="Success"
                clicked={updateToRegister}>
                    Register
                </Button>
            </form>
        </div>
    )
}

Auth.propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object, // TODO: Correct?
    isAuth: PropTypes.bool.isRequired,
    auth: PropTypes.func.isRequired,
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuth: state.auth.token !== null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        auth: (email, password, isRegister, name) => dispatch(actions.auth(email, password, isRegister, name))
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Auth)
