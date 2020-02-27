export const updateObject = (oldObject, updatedProps) => {
    return {
        ...oldObject,
        ...updatedProps,
    }
}


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
        // Can add the regex here later
        isValid &= true
    }

    return isValid;
}