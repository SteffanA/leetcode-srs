import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

import classes from './PageTabs.module.css'

/*
This container stores links to other parts of the same 'page'
*/
const PageTabs = (props) => {
// Hooks
    const [tabState, setCurrentTab] = useState({
        currentTab : ""
    })

    // Deconstruct state
    const {
        currentTab
    } = tabState

    useEffect(() => {
        // On first load, set the currentTab to the first element
        setCurrentTab({currentTab : props.sections[0]})
    }, [setCurrentTab])

    useEffect( () => {
        // intentionally do nothing, refresh this component
        // when the currentTab changes
    }, [currentTab])

// Functions

    // Handler for clicking tabs
    const tabClickHandler = (event, element) => {
        event.preventDefault()
        // Set this tab as the current tab
        setCurrentTab({currentTab : element})
    }

//JSX

    // Get the list of tabs to output
    const tabs = props.sections.map((element) => {
        if (element.localeCompare(currentTab) !== 0) {
            return (
            <div className={classes.tab} onClick={(event, element) => tabClickHandler(event, element)} id={element}>
                {element}
            </div>
            )
        }
        else {
            return null
        }
    })

    return (
        <div>
            {tabs}
        </div>
    )
}

PageTabs.propTypes = {
    sections: PropTypes.array.isRequired,
}

export default PageTabs

