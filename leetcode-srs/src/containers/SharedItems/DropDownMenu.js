import React, {Fragment, useState} from 'react'
import PropTypes from 'prop-types'

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
        </Fragment>
    )
}

DropDownMenu.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
}

export default DropDownMenu