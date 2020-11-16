import {useRef, useEffect} from 'react'

/*
Return an object that is created from an old object where
the properties are replaced with updatedProps
*/
export const updateObject = (oldObject, updatedProps) => {
    return {
        ...oldObject,
        ...updatedProps,
    }
}

export const getTokenOrNull = () => {
    // Get the user's token from local storage
    const token = localStorage.getItem('token')
    if (!token) {
        return null
    }
    return token
}

// Simple helper to generate a link for a problem from a stub
export const createLink = (stub) => {
    return 'https://leetcode.com/problems/' + stub
}

// Check the validity of a form's attributes
export const checkValidity = (value, rules) => {
    let isValid = false
    if (!rules) {
        return true;
    }
    if (rules.required) {
        isValid = value.trim() !== ''
    }

    if (rules.minLength) {
        isValid &= value.trim().length >= rules.minLength
    }

    if (rules.maxLength) {
        isValid &= value.trim().length <= rules.maxLength
    }

    if (rules.isEmail) {
        // TODO: Can add the regex here later
        isValid &= true
    }

    return isValid;
}

// TODO: Test if this works when called from this module
// Function stolen from stack overflow to trace what prop changed
// to cause a page refresh
export const useTraceUpdate = (props) => {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.debug('Changed props:', changedProps);
    }
    prev.current = props;
  });
}