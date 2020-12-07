import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as listActions from '../../store/actions/lists'

import Input from '../UI/Input/Input'
import Button from '../UI/Button/Button'
import Selector from '../SharedItems/Selector/Selector'

import { checkValidity, updateObject } from '../../shared/utility'
import Modal from 'react-modal'
import {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css';
import ProblemViewer from '../Modals/ProblemViewer/ProblemViewer'
import * as listAPI from '../../shared/api_calls/lists'
import ProblemTable from '../SharedItems/ProblemTable/ProblemTable'


/*
This component is used to:
    1) Create new lists
    2) Edit existing lists.
    3) View the current list's problems
    4) Set private lists public
*/ 

Modal.setAppElement('#root')

const ListsManager = props => {

// Hooks and deconstructions
    const [listState, setListState] = useState({
        // Visibility for our forms
        newListFormVisible: true,
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

    const [renameFormState, setRenameFormState] = useState({
        // Visibility for our forms
        renameListFormVisible: false,
        // The controls for our forms
        renameListControls: {
            // New name of the list
            name: {
                elementType: 'input',
                elementConfig: {
                    type: 'name',
                    placeholder: 'List\'s New Name'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 1,
                },
                valid: false,
                touched: false,
            },
        },
        renameFormValid: true, //TODO: Delete this if not used
    })

    // Deconstruct our listState
    const {
        newListFormVisible,
        newListControls,
    } = listState

    const {
        renameListFormVisible,
        renameListControls,
        renameFormValid
    } = renameFormState

    // States for determining visibility of certain elements on the page
    const [listEditorOpen, setListEditorOpen] = useState(false)
    const [viewListContents, setViewListContents] = useState(false)
    // Determine if we show the various list editing tools or not
    const [showEditingTools, setShowEditingTools] = useState(false)

    // Determine if we show our editing tools based on if we have a curList
    useEffect(() => {
        setShowEditingTools(props.curList === null ? false : true)
    }, [props.curList, setShowEditingTools])

    
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
        console.debug('Sending new list to DB')
        // TODO: Do we need to check for failures?
        props.createList(newListName, newListPublicity)
        // If the user didn't have any lists to begin with,
        // go ahead and refresh now, since our normal refresh via
        // the Selector prop won't occur.
        if (props.curList === 'undefined' || props.curList === null) {
            window.open(process.env.REACT_APP_HOST_URL + '/manage-lists', "_self")
        }
        // Reset the form to default
        const updatedControls = newListControls
        updatedControls.name.value = ''
        updatedControls.name.touched = false
        updatedControls.name.valid = false
        updatedControls.isPublic.value = 'private'
        setListState({...listState, updatedControls})
    }

    // Handle an input change on a form element
    // TODO: Could we move this to utility?
    const inputChangedHandler = (event, setter, state, controls, controlKey) => {
        // Update the control linked to the control key
        const updatedControl = updateObject(controls[controlKey], {
            // Update the value
            value: event.target.value,
            // Check if validity changes
            valid: checkValidity(event.target.value, controls[controlKey].validation),
            // Note that the element has now been touched
            touched: true,
        })
        //Attach updated control to our original control
        const updatedControls = controls
        updatedControls[controlKey] = updatedControl
        
        // Update our state
        setter({...state, updatedControls})
    }

    // Set a list to be a public list
    const setListPublic = async (list) => {
        await listAPI.setPublic(list._id).then((res) => {
            if (typeof(res) === String || res === null || res === undefined) {
                // Send an alert on failure to update
                alert('Could not set list public, try again later.')
                (process.env.NODE_ENV === 'development') && console.log('Failed to set list public')
            }
            else {
                (process.env.NODE_ENV === 'development') && console.log('Successful set public')
                // Update the state of the list in redux
                list.public = true
                props.updateCurrentList(list)
            }
        }).catch((err) => {
            console.debug('Failed to set list public')
            console.error(err)
            alert('Could not set list public, try again later.')
        })
    }

    // Permanently deletes a user's private list.
    const deleteList = async (list) => {
        await listAPI.deletePrivateList(list._id).then((res) => {
            alert('List ' + list.name + ' has been permanently deleted!')
            // Get the updated lists array, and reload the page as a side effect
            props.getLists()
        }).catch((err) => {
            console.debug('Failed to delete list.')
            console.error(err)
            alert('Could not delete list, please try again later.')
        })
    }

    const renameList = async (list, newName) => {
        (process.env.NODE_ENV === 'development') && console.log('Renaming list')
        (process.env.NODE_ENV === 'development') && console.log(list)
        (process.env.NODE_ENV === 'development') && console.log(newName)
        // Validate our newName
        if (checkValidity(newName, renameListControls.name.validation)) {
            await listAPI.renamePrivateList(list._id, newName).then((res) => {
                // Reset the form to default
                const updatedControls = renameListControls
                updatedControls.name.value = ''
                updatedControls.name.touched = false
                updatedControls.name.valid = false
                // Update the list array to reflect the new name across redux
                props.getLists()
            }).catch((err) => {
                console.debug('Failed to rename list.')
                console.error(err)
                alert('Could not rename list, please try again later.')
            })
        }
        else {
            alert('Name is invalid, must be 1+ character long.')
        }
    }

    // Modal functions for the ProblemEditor

    // Open/close problem viewer modal
    const openListEditor = (event) => {
        event.preventDefault()
        setListEditorOpen(true)
    }
    const closeListEditor = () => {
        setListEditorOpen(false)
    }

    // Open an alert confirming if user wants to set list public
    const promptListPublic = () => {
        // Confirm the user wants to actually set the list public first
        confirmAlert({
            title: 'Confirm Set Public',
            message: 'Are you sure? Setting a list public cannot be reversed! Public lists are visible by anyone, but can only be edited by you.  You cannot change the name of a public list.',
            buttons: [
                {
                label: 'Yes',
                onClick: () => setListPublic(props.curList)
                },
                {
                label: 'No',
                onClick: null
                }
            ]
        });
    }
    
    // Open an alert confirming if user wants to delete the list
    const promptDeleteList = () => {
        // Confirm the user wants to actually set the list public first
        confirmAlert({
            title: 'Confirm Delete List',
            message: 'Are you sure? Deleting a list is permanent!',
            buttons: [
                {
                label: 'Yes',
                onClick: () => deleteList(props.curList)
                },
                {
                label: 'No',
                onClick: null
                }
            ]
        });
    }
    // Open an alert confirming if user wants to rename the list
    const promptRenameList = () => {
        // Confirm the user wants to actually set the list public first
        confirmAlert({
            title: 'Confirm Rename List',
            message: 'Are you sure you want to rename the list to ' + renameListControls.name.value + '?',
            buttons: [
                {
                label: 'Yes',
                onClick: () => renameList(props.curList, renameListControls.name.value)
                },
                {
                label: 'No',
                onClick: null
                }
            ]
        });
    }
    
    // Setup for problem table - add Time of Next field, generated by the
    // Time of Next redux
    const tonProvider = (problem) => {
        let dateString = ''
        let color = 'black'
        if (props.ton) {
            dateString = new Date(props.ton[problem._id]).toDateString()
            if (problem.color) {
                // Set the color equal to the provided color
                color = problem.color
            }
            // Else keep as default
        }
        else {
            dateString = new Date().toDateString()
            // No ton info means new problem, so set color to red
            color = 'red'
        }
        // Convert into a JSX array so the ProblemTable component
        // can parse this with colors as intended
        return( [<h5 style={{color : color}}>{dateString}</h5>])
    }
    const problemTableFields = [
        {
            'title': 'Time To Next',
            'generator' : tonProvider,
        }
    ]

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
            changed={(event) => inputChangedHandler(event, setListState, listState, newListControls, formElement.id)}
        />
    ))

    const renameFormElements = []
    for (let key in renameListControls) {
        renameFormElements.push({
            id: key,
            config: renameListControls[key]
        })
    }
    const renameListFormElements = renameFormElements.map(formElement => (
        <Input
            key= {formElement.id}
            elementType = {formElement.config.elementType}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            changed={(event) => inputChangedHandler(event, setRenameFormState, renameFormState, renameListControls, formElement.id)}
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

    let renameForm = (
        <div>
            {renameListFormElements}
            <Button 
                btnType="Success"
                clicked={() => promptRenameList()}>
                    Rename {props.curListName}
            </Button>
        </div>
    )

    const viewListContentsBtn = (
        <Button btnType="Success" clicked={() => setViewListContents(!viewListContents)}>
            {viewListContents ? ('Hide ' + props.curListName + '\'s Problems') :
                                ('Show ' + props.curListName + '\'s Problems')}
        </Button>
    )

    const viewRenameFormBtn = (
        <Button btnType="Success" clicked={() => setRenameFormState({...renameFormState, renameListFormVisible : !renameListFormVisible})}>
            {renameFormState.renameListFormVisible? 'Hide Renamer' :
                                'Rename ' + props.curListName}
        </Button>
    )

    const deleteListBtn = (
        <Button btnType="Danger" clicked={promptDeleteList}>
            Delete List
        </Button>
    )

    const listEditorModal = (
        <Modal
            isOpen={listEditorOpen}
            onAfterOpen={null}
            onRequestClose={closeListEditor}
            contentLabel="Problem Viewer Modal"
        >
            <div>
                <Button btnType="Danger" clicked={closeListEditor}>Exit List Editor</Button>
            </div>
            <div>
                <h1>Editing List: {props.curListName}</h1>
                <ProblemViewer/>
            </div>
        </Modal>
    )

    // Items that only make sense to show if we have a list selected
    const listEditorItems = (
        <div>
            <Button btnType="Success" clicked={openListEditor}>Edit Selected List (add or remove problems)</Button>
            {listEditorModal}
            <br/>
            <div>
                <h4>
                    {props.curListName} is: <span style={{color: 'red'}}>{props.curListPublic ? 'Public' : 'Private'}</span>
                </h4>
                {/* If the current list is private, offer the option to set it public*/}
                {!props.curListPublic && <Button btnType="Success" clicked={promptListPublic}>Set Selected List Public</Button>}
                {/* If current list is private, offer ability to rename*/}
                {!props.curListPublic && <br/> && viewRenameFormBtn}
                {!props.curListPublic && renameFormState.renameListFormVisible && renameForm}
                {/* Show the problems currently in the list */}
                <br/>
                {viewListContentsBtn}
                {viewListContents && <ProblemTable problems={props.curProblems} extraFields={problemTableFields} loading={false}/>}
                <br/>
                {/* If current list is private, offer ability to delete it. */}
                {!props.curListPublic && deleteListBtn}
            </div>
        </div>
    )

    return (
        <div>
            {newListFormVisible && newListForm}
            <Selector showLists={true} showProblems={false}/>
            {showEditingTools && listEditorItems}
        </div>
    )
}

ListsManager.propTypes = {
    curListName: PropTypes.string.isRequired,
    curList: PropTypes.object.isRequired,
    curListPublic: PropTypes.bool.isRequired,
    curProblems: PropTypes.array,
    ton: PropTypes.object,
}

const mapStateToProps = (state) => {
    return {
        // Assuming the user is editing a list they want to use next, we should update curList here
        curList: state.lists.curList,
        curListName: state.lists.curListName,
        curListPublic: state.lists.curListPublic,
        curProblems: state.problems.curProblems,
        ton: state.problems.problemIdToTimeOfNextSub,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        createList: (name, isPublic) => dispatch(listActions.listsCreateNewList(name, isPublic)),
        updateCurrentList: (list) => dispatch(listActions.listSetCurrent(list)),
        getLists: () => dispatch(listActions.listsGetAll()),
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(ListsManager)
