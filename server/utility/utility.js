// Contains various helper functions that can be re-used across the app


// Helper function for adding days to a Date
exports.addDays = (days) => {
    let result = new Date(Date.now())
    result.setDate(result.getDate() + days);
    return result;
}

// Adds days to a provided date
exports.addDaysToDate = (date, days) => {
    date.setDate(date.getDate() + days);
    return date;
}

// Sort function for comparing dates
// TODO: Unused - not sure if we'll need, was going to use for 
// problem_statuses/next_times, but determined unneeded. Deletion candidate
// exports.sortByDate= (aDate, bDate) => {
//     if (aDate && bDate) {
//         console.log(aDate)
//         console.log(bDate)
//         // There is an existing date for both, Compare the time
//         return aDate - bDate
//     }
//     else {
//         // The is a date for only one, or neither
//         if (aDate) {
//             // A has a date, so it must be done later than b.
//             return 1
//         }
//         else if (bDate) {
//             // B has a date, it must be done later than A
//             return -1
//         }
//         else {
//             // Both DNE
//             return 0
//         }
//     }
// }

//Sorts the provided statuses based on the time of next submission
exports.sortStatusByNextSubmission = (aStatus, bStatus) => {
    if (aStatus && bStatus) {
        // There is an existing status for both. Compare the time
        return aStatus.next_submission - bStatus.next_submission
    }
    else {
        // The is a status for only one, or neither
        if (aStatus) {
            // A has a status, so it must be done later than b.
            return 1
        }
        else if (bStatus) {
            // B has a status, it must be done later than A
            return -1
        }
        else {
            // Both DNE
            return 0
        }
    }
}

// Determine index to insert a new value into a sorted array
exports.getSortedInsertionIndex = (arr, val, prop = '') => {
    let low = 0
    let high = arr.length

    // Use a binary search to find our insertion index in log(n)
    while (low < high) {
        const mid = (low + high) >>> 1 // Neat bitshift trick for safe //2
        let isLesser = true
        // Determine if the value is less than the value at the index
        // If we pass a property, compare object at index's property
        // Otherwise compare item/object directly to value
        if (prop === '') {
            isLesser = (arr[mid] < val)
        }
        else {
            isLesser = (arr[mid][`${prop}`] < val)
        }

        if (isLesser) {
            low = mid + 1
        }
        else {
            high = mid
        }
    }
    return low
}