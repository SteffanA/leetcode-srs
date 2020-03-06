import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

import classes from './DropDownMenu.module.css'

function DropDownMenu(props) {
    const [visibility, setVisibility] = useState({
        showMenu: false,
    })

    const {
        title,
        updateCurItem,
        items
    } = props

    useEffect(() => {
        // We need to update this if the title changes
        console.log('new title: ', title)
    }, [title])

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
    const setCurItem = (id) => {
        // Find the matching list from curLists based on the passed ID
        console.log(items)
        const matchingItem = items.filter(item => (item.id.localeCompare(id) === 0))
        if (!matchingItem) {
            // I don't see how this can happen - but let's handle it
            console.log('Matching item not found - how did this happen?')
        }
        else {
            // Update the cur list
            console.log('updating to ', matchingItem.name)
            updateCurItem(matchingItem)
        }
    }

    // Set up the selections this drop down menu will provide
    let selections = null

    // Make a button for each item passed
    if (items) {
        selections = items.map(item => (
            <button key={item.id} onClick={() => setCurItem(item.id)}>
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


DropDownMenu.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    updateCurItem: PropTypes.func.isRequired,
}

export default DropDownMenu