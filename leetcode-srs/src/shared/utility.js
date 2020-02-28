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