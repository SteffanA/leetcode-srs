import React, {useState} from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import * as listActions from '../../store/actions/lists'
import classes from './DropDownMenu.module.css'

function DropDownMenu(props) {
    const [visibility, setVisibility] = useState({
        showMenu: false,
    })

    const menuVisibilityHandler = (event) => {
        event.preventDefault()

        if (!visibility.showMenu) {
            // Menu is about to be set to visible.
            // Add a click handler for the document so a click outside
            // the menu will once again collapse the menu.
            document.addEventListener('click', removeMenu)
            setVisibility({showMenu: true})
        }
        else {
            // Menu is about to be set invisible. Remove our click
            // listener on the document
            document.removeEventListener('click', removeMenu)
            setVisibility({showMenu: false})
        }
    }

    const removeMenu = (event) => {
        event.preventDefault()
        document.removeEventListener('click', removeMenu)
        setVisibility({showMenu: false})
    }

    // Set the current list when a list is selected from the drop down
    const setCurList = (id) => {
        // Find the matching list from curLists based on the passed ID
        let matchingList = null
        console.log(props.lists)
        console.log(id)
        let list = null
        for (list in props.lists) {
            console.log(list)
            if (list._id.localeCompare(id) === 0) {
                // Found our matching list.
                matchingList = list
                break
            }
        }
        if (!matchingList) {
            // I don't see how this can happen - but let's handle it
            console.log('List not found.')
        }
        else {
            // Update the cur list
            console.log('updating to ', matchingList)
            props.updateCurList(matchingList)
        }
    }

    // Set up the selections this drop down menu will provide
    let selections = null

    // Make a button for each item passed
    if (props.items) {
        selections = props.items.map(item => (
            <button key={item.id} onClick={() => setCurList(item.id)}>
                {item.name}
            </button>
        ))
    }

    return (
        <div className={classes.DropDownMenu}>
            <button onClick={menuVisibilityHandler}>
                Select {props.title}
            </button>
            {visibility.showMenu ? (
                <div className={classes.Menu}>
                    {selections}
                </div>
            )
            :
            null
            }
        </div>
    )
}

const mapStateToProps = state => {
    return {
        lists: state.lists.usersLists,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateCurList: (list) => listActions.listSetCurrent(list),
    }
}


DropDownMenu.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(DropDownMenu)