import React, {Fragment, useState} from 'react'
import PropTypes from 'prop-types'

import classes from './DropDownMenu.module.css'

function DropDownMenu(props) {
    const [visibility, setVisibility] = useState({
        showMenu: false,
        visibleMenu: null,
    })

    const menuVisibilityHandler = (event) => {
        event.preventDefault()

        if (!visibility.showMenu) {
            // Menu is about to be set to visible.
            // Add a click handler for the document so a click outside
            // the menu will once again collapse the menu.
            document.addEventListener('click', menuVisibilityHandler)
            setVisibility({showMenu: true})
        }
        else {
            // If we determined that we want clicks on the menu to keep it
            // open via the 'stayOpen' prop, first check the origin of the
            // click prior to making the menu invisible and removing the click
            // listener.
            if (props.stayOpen) {
                if (visibility.visibleMenu.contains(event.target)){
                    // This click was within the menu. Ignore it and return.
                    return
                }
                // Implicit else is continue onward to close the menu
            }
            // Menu is about to be set invisible. Remove our click
            // listener on the document
            document.removeEventListener('click', menuVisibilityHandler)
            setVisibility({showMenu: false})
        }
    }

    const backgroundClickHandler = (event) => {
        event.preventDefault()
        // If we click on the background, we should close the menu.
        setVisibility({showMenu: false})
    }

    // Set up the selections this drop down menu will provide
    let selections = null

    // Make a button for each item passed
    if (props.items) {
        selections = props.items.map(item => (
            <button>
                {item}
            </button>
        ))
    }

    return (
        <Fragment>
            <div onClick={backgroundClickHandler} className={classes.Background}/>
            <div className={classes.DropDownMenu}>
                <button onClick={menuVisibilityHandler}>
                    Select {props.title}
                </button>
                {visibility.showMenu ? (
                    <div className={classes.Menu}
                    ref={(element) => {visibility.visibleMenu = element}}>
                        {selections}
                    </div>
                )
                :
                null
                }
            </div>
        </Fragment>
    )
}

DropDownMenu.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    stayOpen: PropTypes.bool,
}

export default DropDownMenu