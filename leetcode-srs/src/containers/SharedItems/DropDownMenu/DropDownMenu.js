import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

import classes from './DropDownMenu.module.css'

function DropDownMenu(props) {
    const [visibility, setVisibility] = useState({
        showMenu: false,
    })

    const {
        updateCurItem,
        items,
        titleItem,
    } = props

    const [curTitle, setCurTitle] = useState('Nothing here. Create a list/add problems')
    const [titleColor, setTitleColor] = useState(null)

    // Update the title based on the passed prop
    useEffect(() => {
        if (titleItem) {
            setCurTitle(titleItem.name)
            if (titleItem.color) {
                setTitleColor(titleItem.color)
            }
        }
        else {
            setCurTitle('Nothing here. Create a list/add problems')
            setTitleColor(null)
        }
    }, [titleItem])

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
        // Find the matching item from props items based on the passed ID
        const matchingItems = items.filter(item => (item._id.localeCompare(id) === 0))
        if (!matchingItems) {
            // I don't see how this can happen - but let's handle it
            if (process.env.NODE_ENV === 'development') {
                console.log('Matching item not found - how did this happen?')
            }
        }
        else {
            // Update the cur item
            // Note filter returns an array; there should only be 1 matching element
            // so we'll grab the first
            updateCurItem(matchingItems[0])
        }
    }

    // Set up the selections this drop down menu will provide
    let selections = null

    // Make a button for each item passed
    if (items && Array.isArray(items)) {
        selections = items.map(item => {
            // Items may have a color defined - add it if available.
            let itemColor = null
            if (item.color) {
                itemColor = item.color
            }
            return (
                <button style={{color : itemColor}} key={item._id} onClick={() => setCurItem(item._id)}>
                    {item.name}
                </button>
            )}
        )
    }
    else if(items) {
        console.debug('Items in DropDownMenu not of type array, investigate')
    }

    return (
        <div className={classes.DropDownMenu}>
            <button onClick={menuVisibilityHandler} style={{color : titleColor}}>
                <b style={{color: 'black'}}>Select: </b> {curTitle}
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
    title: PropTypes.string,
    items: PropTypes.array,
    updateCurItem: PropTypes.func.isRequired,
}

export default DropDownMenu