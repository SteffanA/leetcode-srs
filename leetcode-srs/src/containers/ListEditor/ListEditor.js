import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as listActions from '../../store/actions/lists'

import Input from '../UI/Input/Input'
import Button from '../UI/Button/Button'

import { checkValidity, updateObject} from '../../utility/utility'


/*
This component is used to:
    1) Create new lists
    2) Edit existing lists.
*/ 

// We want a form for creating new lists
// Want a tab selector for new or existing edit
// want a list of problems - limit to like 100 per page maybe
// want a search input to search through our problems by title
    // Eventually could add tag searching since we have tags too

const ListEditor = props => {

// Hooks and deconstructions
    const [listState, setListState] = useState({
        // Visibility for our forms
        newListFormVisible: true,
        editListFormVisible: false,
        // The controls for our forms
        newListControls: {
            // Name of the new list
            name: {
                elementType: 'input',
                elementConfig: {
                    type: 'name',
                    placeholder: 'List Name'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 1,
                },
                valid: false,
                touched: false,
            },
            // If new list is public or private
            isPublic: {
                elementType: 'select',
                elementConfig: {
                    // TODO: This isn't working right
                    type: 'public',
                    options: [
                        'Private',
                        'Public'
                    ]
                },
                validation: {
                    required: true,
                },
                valid: true,
                touched: false,
            }
        },
    })

    // Deconstruct our listState
    const {
        newListFormVisible,
        editListFormVisible,
        newListControls,
    } = listState

    useEffect(() => {
        console.log('In list editor')
    }, [])

    
// Functions

    // Handle a generic form submission
    const newListSubmitHandler = (event) => {
        event.preventDefault() // Prevent a page reload
        // Deconstruct our controls
        const {
            name,
            isPublic
        } = newListControls

        // TODO: Setup so we add new list to DB
        console.log('Sending new list to DB')
        
    }

    // Handle an input change on a form element
    const inputChangedHandler = (event, controlKey) => {
        // Update the control linked to the control key
        const updatedControl = updateObject(newListControls[controlKey], {
            // Update the value
            value: event.target.value,
            // Check if validity changes
            valid: checkValidity(event.target.value, newListControls[controlKey].validation),
            // Note that the element has now been touched
            touched: true,
        })
        //Attach updated control to our original control
        const updatedControls = newListControls
        updatedControls[controlKey] = updatedControl
        
        // Update our state
        setListState({...listState, updatedControls})
    }

// JSX
    const formElements = []
    for (let key in newListControls) {
        formElements.push({
            id: key,
            config: newListControls[key]
        })
    }

    const createNewListForm = formElements.map(formElement => (
        <Input
            key= {formElement.id}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            changed={(event) => inputChangedHandler(event, formElement.id)}
        />
    ))

    return (
        <div>
            <form onSubmit={newListSubmitHandler}>
                {createNewListForm}
                <Button 
                btnType="Success"
                clicked={null}>
                    Create New List
                </Button>
            </form>
        </div>
    )
}

ListEditor.propTypes = {

}

const mapStateToProps = (state) => {
    return {
        // Assuming the user is editing a list they want to use next, we should update curList here
        curList: state.lists.curList,
        curListName: state.lists.curListName,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        createList: (name, isPublic) => dispatch(listActions.listsCreateNewList(name, isPublic)),
        // get problems
        // get list's problems
        // add problem to list
        // remove problem from list
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(ListEditor)
