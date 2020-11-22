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

exports.sortStatusByNextSubmission = (aStatus, bStatus) => {
    if (aStatus && bStatus) {
        // There is an existing status for both. Compare the time
        return aStatus.next_submission - bStatus.next_submission
    }
    else {
        // The is a status for only one, or neither
        if (aStatus) {
            // A has a status, so it must be done later than b.
            return 0
        }
        else {
            // Either B has the status, or neither do. return a in either case
            return -1
        }
    }
}