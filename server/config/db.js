const mongoose = require('mongoose') // For DB access
const dotenv = require('dotenv') // For environment var access
dotenv.config({path: '../.env'}) // Load our environ vars

/*
Due to some issues reported online, changed to have options in connect function
See: https://github.com/Automattic/mongoose/issues/8180, https://github.com/Automattic/mongoose/issues/8381

May need &tlsInsecure=true option
*/
// Connect to test database if started with Testing var enabled, otherwise prod db
const TEST = process.env.TESTING
const HOST = (TEST ? process.env.TEST_MONGODB_HOST : process.env.MONGODB_HOST)
const PORT = (TEST ? process.env.TEST_MONGODB_PORT : process.env.MONGODB_PORT)
// The MongoDB connection string
const db = `mongodb://${HOST}:${PORT}?retryWrites=true&w=majority`

// Connect to our MongoDB instance
const connectDB = async () => {
    try {
        // Use test parameters if we're connecting to the test DB otherwise use production params
        const USER = (TEST ? process.env.TEST_MONGODB_USER : process.env.MONGODB_USER)
        const PASS = (TEST ? process.env.TEST_MONGODB_PASS : process.env.MONGODB_PASS)
        const DB_NAME = process.env.DATABASE_NAME
        if (TEST) {
            console.log('Connecting to test database...')
        }
        await mongoose.connect(db, {
            // These are options to get rid of depreciation messages
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            user: `${USER}`,
            pass: `${PASS}`,
            dbName: `${DB_NAME}`,
        })
        console.log(`MongoDB connected on ${HOST} via port ${PORT}...`)
    } catch (error) {
        console.log('Failed to connect to the database with error: \n' + error)
        console.log('Message only:\n' + error.message)
        // Exit w/ failure on error
        process.exit(1)
    }
}

module.exports = connectDB