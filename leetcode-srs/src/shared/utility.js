import {useRef, useEffect} from 'react'
import {getProblemToNextSubTime} from '../shared/api_calls/problemStatuses'

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

// Add a number of days to today's date and return the date object
export const addDays = (days) => {
    let result = new Date(Date.now())
    result.setDate(result.getDate() + days);
    return result;
}

// Default dict equivelent
// Sample usage:
/*
const lists = new DefaultDict(Array)
lists.men.push('bob')
lists.women.push('alice')
console.log(lists.men) // ['bob']
console.log(lists.women) // ['alice']
console.log(lists.nonbinary) // []
*/
export class DefaultDict {
  constructor(defaultInit) {
    return new Proxy(Map, {
      get: (target, name) => name in target ?
        target[name] :
        (target[name] = typeof defaultInit === 'function' ?
          new defaultInit().valueOf() :
          defaultInit)
    })
  }
}


export const getTimeToNextSubmissionToProblemMap = async (problems) => {
    // Get the user's token from local storage
    const token = getTokenOrNull()
    // Can't make updates without having a token
    if (token === null) {
        return 'User not logged in!'
    }
    else {
        try {
            const probToTimeMap = await getProblemToNextSubTime(problems)
            // Result is problemID : date
            let timeToProbsMap = new DefaultDict(Set)
            for (let prob of Object.keys(probToTimeMap)) {
                let time = probToTimeMap[prob]
                // MongoDB format will be something like 2020-11-18T21:52:21.804Z
                // Convert to a more 'normalized' date object for ease of comparison
                // In the event the problem hasn't been done, the provided date
                // is in standard MS, which also works fine as an arg
                time = new Date(time)
                timeToProbsMap[time].add(prob)
            }
            timeToProbsMap = Object.assign({}, timeToProbsMap)
            return timeToProbsMap
        } catch (error) {
            console.error('Error trying to get time to sub map')
            console.error(error)
            return new Map()
        }
    }
}