const mongoose = require('mongoose') // For DB access
const dotenv = require('dotenv') // For environment var access
dotenv.config({path: '../.env'}) // Load our environ vars

// Set the enviroment variable MONGO_DB access to the string value of the access point to the DB,
// with credentials

/*
The mongoDB connection string, broken up to be readable

Generic version from docs:
'mongodb://username:password@host:port/database?options'

For this project
'mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}'
@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.DATABASE_NAME}
?authSource=admin

Due to some issues reported online, changed to have options in connect function
See: https://github.com/Automattic/mongoose/issues/8180, https://github.com/Automattic/mongoose/issues/8381

May need &tlsInsecure=true option
*/
let db = ''
// Connect to test database if started with Testing var enabled
const TEST = process.env.TESTING
if (TEST) {
    db = `mongodb://${process.env.TEST_MONGODB_HOST}:${process.env.TEST_MONGODB_PORT}?retryWrites=true&w=majority`
}
else {
    db = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}?retryWrites=true&w=majority`
}

// Connect to our MongoDB instance
const connectDB = async () => {
    try {
        // Use test parameters if we're connecting to the test DB
        if (TEST) {
            console.log('Connecting to test database...')
            await mongoose.connect(db, {
                // These are options to get rid of depreciation messages
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                user: `${process.env.TEST_MONGODB_USER}`,
                pass: `${process.env.TEST_MONGODB_PASS}`,
                dbName: `${process.env.DATABASE_NAME}`,
            })
            console.log(`MongoDB connected on ${process.env.TEST_MONGODB_HOST} via port ${process.env.TEST_MONGODB_PORT}...`)
        }
        else {
            await mongoose.connect(db, {
                // These are options to get rid of depreciation messages
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                user: `${process.env.MONGODB_USER}`,
                pass: `${process.env.MONGODB_PASS}`,
                dbName: `${process.env.DATABASE_NAME}`,
            })
            console.log(`MongoDB connected on ${process.env.MONGODB_HOST} via port ${process.env.MONGODB_PORT}...`)
        }
    } catch (error) {
        console.log('Failed to connect to the database with error: ')
        console.log(error.message)
        // Exit w/ failure on error
        process.exit(1)
    }
}

module.exports = connectDB