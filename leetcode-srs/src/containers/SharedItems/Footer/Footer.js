import React from 'react'
import classes from './Footer.module.css'

// Contains outlinks/supplementary info to display on every page
const Footer = (props) => {

// JSX
    return (
        <div id="footer" className="flex center-text justify-center border-t-2 border-black text-yellow-900"> 
             <a href="https://github.com/SpaIns/leetcode-srs">Check out the source here.</a>
        </div>
    )
}

export default Footer
