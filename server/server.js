const express = require('express')
// const session = require('express-session')
const connectDB = require('./config/db')
const https = require('https') // For secure hosting
const fs = require('fs') // For getting HTTPS cert and key
const dotenv = require('dotenv') // For getting environmental vars from .env file
// Can comment above and below out if just using default port
dotenv.config({path: '../.env'}) // Config environ vars

// Setup our server
const app = express()

// Connect to our DB
connectDB()
// Init our middleware
app.use(express.json({extended: true, limit: '50mb'}))

// Setup the API
app.get('/', (req, res) => res.send('API running.'))

// Define our routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/problems', require('./routes/api/problems'))
app.use('/api/lists', require('./routes/api/lists'))
app.use('/api/problem_status', require('./routes/api/problemStatuses'))
app.use('/api/submissions', require('./routes/api/submissions'))

// Helper functions for creating an HTTP or HTTPS server
const createHTTPserver = (port, type) => {
    // app.use(session({cookie: {sameSite: 'lax'},}))
    app.listen(port, () => console.log(`${type}server started on port ${port}`))
}

const createHTTPSserver = (port, type) => {
    // TODO: The auto-deploy docker-compose doesn't connect to the HTTPS version
    // of the server. Need to determine if a server issue, or reverse proxy one.

    // Create a HTTPS server
    /*
    Code assumes you have a cert with a passphrase.
    Passing a blank passphrase should work okay as well. TODO: Test
    You can self-sign a cert via:
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
    */
    const cert = process.env.CERT_PATH
    const key = process.env.CERT_KEY_PATH
    const passphrase = process.env.CERT_PASSPHRASE
    https.createServer({
        key: fs.readFileSync(`${key}`),
        cert: fs.readFileSync(`${cert}`),
        passphrase: `${passphrase}`,
        cookie: {sameSite: 'lax'}, // TODO: Is this required?
    }, app)
    .listen(port, () => console.log(`Secure ${type}server started on port ${port}`))
}

// Determine if server should be hosted as HTTP or HTTPS
const SECURE = process.env.HTTPS
// Determine if we're running tests
const TEST = process.env.TESTING
// Define the port to listen on - environmental variable optional
const PORT = (TEST ? (process.env.TEST_SERVER_PORT || 61234) :
                     (process.env.SERVER_PORT || 5000))
// Create the 'server type' string - blank for normal, test if testing
const TYPE = (TEST ? 'Test ' : '')

if (SECURE) {
    // Create an HTTPS server
    createHTTPSserver(PORT, TYPE)
}
else {
    // Create an HTTP server
    createHTTPserver(PORT, TYPE)
}
// if (TEST) {
//     // Start up a basic HTTP server
//     app.listen(TEST_PORT, () => console.log(`Test server started on port ${TEST_PORT}`))
// }
// else if (SECURE) {
//     // TODO: The auto-deploy docker-compose doesn't connect to the HTTPS version
//     // of the server. Need to determine if a server issue, or reverse proxy one.

//     // Create a HTTPS server
//     /*
//     Code assumes you have a cert with a passphrase.
//     Passing a blank passphrase should work okay as well. TODO: Test
//     You can self-sign a cert via:
//     openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
//     */
//     const cert = process.env.CERT_PATH
//     const key = process.env.CERT_KEY_PATH
//     const passphrase = process.env.CERT_PASSPHRASE
//     https.createServer({
//         key: fs.readFileSync(`${key}`),
//         cert: fs.readFileSync(`${cert}`),
//         passphrase: `${passphrase}`,
//         cookie: {sameSite: 'lax'}, // TODO: Is this required?
//     }, app)
//     .listen(PORT, () => console.log(`Secure server started on port ${PORT}`))
// }
// else {
//     // app.use(session({cookie: {sameSite: 'lax'},}))
//     app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
// }

module.exports = app