import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as listActions from '../../store/actions/lists'

import Input from '../UI/Input/Input'
import Button from '../UI/Button/Button'
//import PageTabs from '../UI/PageTabs/PageTabs'
import Selector from '../MainPage/Selector/Selector'

import { checkValidity, updateObject} from '../../utility/utility'
import Modal from 'react-modal'
import ProblemViewer from '../Modals/ProblemViewer/ProblemViewer'


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

// TODO: Change the URL from create-lists to manage-lists
//          Actually... maybe split into two different pages, but on create-list submission, redirect to
//          the edit-list form with the just-made list pre-selected
/*
Idea for the list editing
    Take the problem viewer, add new row for add to list/remove from list
    Change button text/action based on if ID for problem already in selected list
    Show contents of list via problem name in small window on right side
*/

Modal.setAppElement('#root')

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
                    options: [
                        {
                            value: 'private',
                            displayValue: 'Private',
                        },
                        {
                            value: 'public',
                            displayValue: 'Public',
                        },
                    ]
                },
                value: 'private', //default
                valid: true, //no validation required
            },
        },
        formValid: true, //TODO: Delete this if not used
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

    const [modalIsOpen, setIsOpen] = useState(false)

    
// Functions

    // Handle a generic form submission
    const newListSubmitHandler = (event) => {
        event.preventDefault() // Prevent a page reload
        // Deconstruct our controls
        const {
            name,
            isPublic
        } = newListControls

        // Grab our values from our controls
        const newListName = name.value
        const newListPublicity = isPublic.value

        // Send new list to DB
        console.log('Sending new list to DB')
        props.createList(newListName, newListPublicity)
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

    // CModal functions copied from example
    const openModal = (event) => {
        event.preventDefault()
        setIsOpen(true)
        console.log('opened modal')
    }

    const afterOpenModal = () => {
        // references are now sync'd and can be accessed.
        // subtitle.style.color = '#f00';
        console.log('After open modal')
    }
    
    const closeModal = () => {
        setIsOpen(false);
        console.log('Modal is closed')
    }

// JSX
    const formElements = []
    for (let key in newListControls) {
        formElements.push({
            id: key,
            config: newListControls[key]
        })
    }

    const createNewListFormElements = formElements.map(formElement => (
        <Input
            key= {formElement.id}
            elementType = {formElement.config.elementType}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            changed={(event) => inputChangedHandler(event, formElement.id)}
        />
    ))

    let newListForm = (
        <form onSubmit={newListSubmitHandler}>
            {createNewListFormElements}
            <Button 
                btnType="Success"
                clicked={null}>
                    Create New List
                </Button>
        </form>
    )

    // Tabs for which form to display
    const availableTabs = [
        'Create new list',
        'Edit existing list',
    ]

    const test = ''


    return (
        <div>
            {newListForm}
            <Selector showLists={true} showProblems={false}/>
            <Button btnType="Success" clicked={openModal}>Edit Selected List</Button>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                contentLabel="Example Modal"
            >
                <div>
                    <Button btnType="Danger" clicked={closeModal}>Exit List Editor</Button>
                </div>
                <div>
                    <h1>Editing List: {props.curListName}</h1>
                    <ProblemViewer/>
                </div>
            </Modal>
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
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(ListEditor)
