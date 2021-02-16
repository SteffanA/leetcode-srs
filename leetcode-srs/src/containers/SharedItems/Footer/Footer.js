import React from 'react'
import classes from './Footer.module.css'

// Contains outlinks/supplementary info to display on every page
const Footer = (props) => {

// JSX
    return (
        <div id="footer" className="flex center-text justify-center border-t-2 border-black text-yellow-700"> 
             <a className="mr-4" href="https://github.com/SpaIns/leetcode-srs">Check out the source here.</a><a className="ml-4" href="https://jira.steffan.duckdns.org">Check out WIP items here.</a>
        </div>
    )
}

export default Footer
