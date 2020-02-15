const express = require('express')
const connectDB = require('./config/db')
const dotenv = require('dotenv') // For getting environ vars from .env file
// Can comment above and below out if just using default port
dotenv.config() // Config environ vars

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


// Define the port to listen on - environmental variable optional
const PORT = process.env.SERVER_PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))