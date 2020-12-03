import React from 'react'
import classes from './Footer.module.css'

// Contains outlinks/supplementary info to display on every page
const Footer = (props) => {

// JSX
    return (
        <div className={classes.Footer}>
             <a href="https://github.com/SpaIns/leetcode-srs">Check out the source here.</a>
        </div>
    )
}

export default Footer
