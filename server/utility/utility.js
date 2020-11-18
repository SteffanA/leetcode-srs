// Contains various helper functions that can be re-used across the app


// Helper function for adding days to a Date
exports.addDays = (days) => {
    let result = new Date(Date.now())
    result.setDate(result.getDate() + days);
    return result;
}