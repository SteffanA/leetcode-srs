import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as listActions from '../../store/actions/lists'
import * as problemActions from '../../store/actions/problems'

import Input from '../UI/Input/Input'
import Button from '../UI/Button/Button'
import Selector from '../SharedItems/Selector/Selector'

import { checkValidity, updateObject } from '../../shared/utility'
import Modal from 'react-modal'
import ProblemViewer from '../Modals/ProblemViewer/ProblemViewer'
import {setPublic} from '../../shared/api_calls/lists'
import ProblemTable from '../SharedItems/ProblemTable/ProblemTable'


/*
This component is used to:
    1) Create new lists
    2) Edit existing lists.
    3) View the current list's problems
    4) Set private lists public
*/ 

Modal.setAppElement('#root')

const ListEditor = props => {

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

    // Deconstruct our listState
    const {
        newListFormVisible,
        newListControls,
    } = listState

    // State of our modals, ProblemViewer and SetPublic
    const [problemViewerOpen, setProblemViewerOpen] = useState(false)
    const [publicOpen, setPublicOpen] = useState(false)
    const [viewListContents, setViewListContents] = useState(false)
    

    
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

    // Set a list to be a public list
    const setListPublic = async (e, list) => {
        e.preventDefault()
        console.log('Setting list public')
        // const res = await setListPublic(listID)
        // const res = await feedReducer(listID)
        await setPublic(list.id).then((res) => {
            if (typeof(res) === String || res === null || res === undefined) {
                // Send an alert on failure to update
                alert('Could not set list public, try again later.')
                console.log('Failed to set list public')
            }
            else {
                console.log('Successful set public')
                // Set the modal to close on success
                setPublicOpen(false)
                // Update the state of the list in redux
                list.public = true
                props.updateCurrentList(list)
            }
        }).catch((err) => {
            console.debug(err)
            alert('Could not set list public, try again later.')
            console.log('Failed to set list public')
        })
    }

    // Modal functions for the ProblemViewer and SetPublic modals

    // Open/close problem viewer modal
    const openProblemViewer = (event) => {
        event.preventDefault()
        setProblemViewerOpen(true)
        console.log('opened PV')
    }
    const closeProblemViewer = () => {
        setProblemViewerOpen(false)
        console.log('PV is closed')
    }

    // Set list public Modal open/close
    const openPublicModal = (event) => {
        event.preventDefault()
        setPublicOpen(true)
        console.log('opened public modal')
    }
    const closePublicModal = () => {
        setPublicOpen(false)
        console.log('public modal is closed')
    }

    // Cleanup function for after the modal has been opened
    const afterOpenModal = () => {
        // references are now sync'd and can be accessed.
        // subtitle.style.color = '#f00';
        console.log('After open PV')
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

    let viewListContentsBtn = (
        <Button btnType="Success" clicked={() => setViewListContents(!viewListContents)}>
            {viewListContents ? ('Hide ' + props.curListName + '\'s Problems') :
                                ('Show ' + props.curListName + '\s Problems')}
        </Button>
    )

    return (
        <div>
            {newListFormVisible && newListForm}
            <Selector showLists={true} showProblems={false}/>
            <Button btnType="Success" clicked={openProblemViewer}>Edit Selected List</Button>
            <Modal
                isOpen={problemViewerOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeProblemViewer}
                contentLabel="Problem Viewer Modal"
            >
                <div>
                    <Button btnType="Danger" clicked={closeProblemViewer}>Exit List Editor</Button>
                </div>
                <div>
                    <h1>Editing List: {props.curListName}</h1>
                    <ProblemViewer/>
                </div>
            </Modal>
            <br/>
            <div>
                <h4>{props.curListName} is: </h4>
                <h4 style={{color: 'red'}}>{props.curListPublic ? 'Public' : 'Private'}</h4>
                {/* If the current list is private, offer the option to set it public
                TODO: Instead of a modal, replace with a standard pop-up?
                */}
                {!props.curListPublic && <Button btnType="Success" clicked={openPublicModal}>Set Selected List Public</Button>}
                <Modal
                    isOpen={publicOpen}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={closePublicModal}
                    contentLabel="Set Public List Modal"
                >
                    <div>
                        <Button btnType="Success" clicked={closePublicModal}>Back to List Editor</Button>
                    </div>
                    <div>
                        <h1>Really set {props.curListName} public? This cannot be reversed!</h1>
                        <p>Public lists can be viewed by anyone logged in!</p>
                        <Button btnType="Danger" clicked={(event) => setListPublic(event,props.curList)}>Set Public</Button>
                    </div>
                </Modal>
                {/* Show the problems currently in the list */}
                <br/>
                {viewListContentsBtn}
                {viewListContents && <ProblemTable problems={props.curProblems} extraFields={problemTableFields}/>}
            </div>
        </div>
    )
}

ListEditor.propTypes = {
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
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(ListEditor)
