const mongoose = require('mongoose') // For DB access
const dotenv = require('dotenv') // For environment var access
dotenv.config() // Load our environ vars

// Set the enviroment variable MONGO_DB access to the string value of the access point to the DB,
// with credentials
const db = process.env.MONGODB_ACCESS

// Connect to our MongoDB instance
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            // These are options to get rid of depreciation messages
            useNewUrlParser: true,
        })
        console.log('MongoDB connected...')
    } catch (error) {
        console.log('Failed to connect to the database with error: ')
        console.log(error.message)
        // Exit w/ failure on error
        process.exit(1)
    }
}

module.exports = connectDB