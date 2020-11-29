import React from 'react'
import classes from './Input.module.css'
import Button from '../Button/Button'

// A class that overwrites the normal <input> tag
// with some custom functionality that I always want
// This is most useful for the 'select' type, where it automatically
// provides unique keys for every option
const input = (props) => {
    let inputElement = null
    const inputClasses = [classes.InputElement]

    if (props.invalid && props.shouldValidate && props.touched) {
        inputClasses.push(classes.Invalid)
    }

    // Auto-highlight the text in the search box as a QOL feature
    const selectText = (event) => {
        event.target.select()
    }

    // Use this to make this Input more generic
    switch(props.elementType) {
        case('input'):
            inputElement = <input className={inputClasses.join(' ')} 
                {...props.elementConfig} 
                value={props.value}
                onChange={props.changed}
                onFocus={selectText}/>
            break
        case('textarea'):
            inputElement = <textarea className={inputClasses.join(' ')} 
                {...props.elementConfig} 
                value={props.value}
                onChange={props.changed}/>
            break
        case('textareapython'):
            inputElement = <textarea className={inputClasses.join(' ') + ' class="prism-live language-python"'} 
                {...props.elementConfig} 
                value={props.value}
                onChange={props.changed}/>
            break
        case('select'):
            inputElement = <select className={inputClasses.join(' ')}
                value={props.value}
                onChange={props.changed}>
                    {props.elementConfig.options.map(option => (
                        <option value={option.value} key={option.value}>
                            {option.displayValue}
                        </option>
                    ))}
                </select>
            break
        case('submit'):
            // TODO: This might be better served as a normal <input type="submit"/>
            inputElement = <Button className={inputClasses.join(' ')}
                btnType="Success"
                clicked={props.clicked}>
                {props.value}
                </Button>
            break;
        default:
            inputElement = <input className={inputClasses.join(' ')} 
                {...props.elementConfig} 
                value={props.value}
                onChange={props.changed}/>
    }
    return (
        <div className={classes.Input}>
            <label className={classes.Label}>{props.label}</label>
            {inputElement}
        </div>
    )
}

export default input;