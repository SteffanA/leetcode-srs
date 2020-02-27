const express = require('express')
const connectDB = require('./config/db')
const https = require('https') // For secure hosting
const fs = require('fs') // For getting HTTPS cert and key
const dotenv = require('dotenv') // For getting environ vars from .env file
// Can comment above and below out if just using default port
dotenv.config({path: '../.env'}) // Config environ vars

const app = express()

// Connect to our DB
connectDB()
// Init our middleware
app.use(express.json({extended: false}))

// Setup the API
app.get('/', (req, res) => res.send('API running.'))

// Define our routes
app.use('/api/users', require('./routes/api/users'))
//TODO: Define the rest of the routes after they're built
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/problems', require('./routes/api/problems'))
app.use('/api/lists', require('./routes/api/lists'))
app.use('/api/problem_status', require('./routes/api/problemStatuses'))
app.use('/api/submissions', require('./routes/api/submissions'))


// Define the port to listen on - environmental variable optionala
const PORT = process.env.SERVER_PORT || 5000
const SECURE = process.env.HTTPS

if (SECURE) {
    // Create a HTTPS server
    const cert = process.env.CERT_PATH
    const key = process.env.CERT_KEY_PATH
    https.createServer({
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
    }, app)
    .listen(PORT, () => console.log(`Secure server started on port ${PORT}`))
}
else {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
}