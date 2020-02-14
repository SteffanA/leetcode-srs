const mongoose = require('mongoose') // For DB access
const dotenv = require('dotenv') // For environment var access
dotenv.config() // Load our environ vars

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

May need &tlsInsecure=true option
*/
const db = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.DATABASE_NAME}?authSource=admin`

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