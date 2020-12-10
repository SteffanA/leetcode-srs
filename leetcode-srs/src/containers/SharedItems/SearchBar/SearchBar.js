import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Input from '../../UI/Input/Input'

// A basic search bar + submit button to handle input+searching
export const SearchBar = (props) => {

    const {
        defaultText, // default text for the search bar
        handleSubmit, // handler for submission - required params are (event, searchTerm)
        termGetter, // function for the parent to take the search term
    } = props


    // Keep track of the term being searched for
    const [
        searchTerm,
        setSearchTerm
    ] = useState(defaultText)

    // Keep track of the current search term query
    // This may be slightly different than the search term,
    // as this is set based on user input, and is sent to the
    // searchTerm on a delay so the searchTerm isn't constantly
    // updating as the user types
    const [
        query,
        setQuery
    ] = useState(defaultText)
    
    // Setup our hook so that we only update the search term after a 
    // given period
    useEffect (() => {
        const timeOutId = setTimeout(async () => {
            if (process.env.NODE_ENV === 'development') {
                console.log('Auto updating and querying with ' + query)
            }
            
            // If the query is undefined, set to blank string
            let curQuery = query
            if (!query) {
                curQuery = ''
                setQuery(curQuery)
                setSearchTerm(curQuery)
            }
            // Don't submit if it's a undefined query
            else {
                setSearchTerm(curQuery)
                // Update the prop as well
                if (termGetter !== null) {
                    termGetter(curQuery)
                }
                // Auto-update the results
                // Use query since the search term may not be set in time
                // for getXSearchResults to execute on the right text
                // Create dummy event to prevent in the handleSubmit function
                const e = new Event('Event')
                handleSubmit(e, curQuery)
            }
        }, 1000)
        return () => clearTimeout(timeOutId)
    }, [query])

    /* Submission and change handlers */

    const handleChange = (event) => {
        setQuery(event.target.value)
    }

    return (
        <div>
            <form className="SearchBar">
                <label>
                    Search for a problem:
                    <Input elementType='input' name="name" value={query} changed={handleChange}/>
                </label>
                <Input elementType="submit" value="Submit" clicked={handleSubmit}/>
            </form>
        </div>
    )
}

SearchBar.propTypes = {
    defaultText : PropTypes.string,
    handleSubmit : PropTypes.func,
}

export default SearchBar
