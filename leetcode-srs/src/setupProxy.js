/*
Proxy for our requests to the backend to prevent CORS errors
*/
const {createProxyMiddleware }= require('http-proxy-middleware')
const morgan = require('morgan')

// Redirect our requests sent to this app's /api to go to backend
module.exports = app => {
    app.use(
        '/api',
        createProxyMiddleware({
            target: {
                host: `${process.env.REACT_APP_API_URL}`,
                protocol: `${process.env.REACT_APP_API_PROTOCOL}:`,
                port: process.env.REACT_APP_API_PORT,
            },
            get secure() {
                // Set secure based on the protocol
                return ('http'.localeCompare(`${process.env.REACT_APP_API_PROTOCOL}`) === 0 ? false : true)
            },
            changeOrigin: true,
            logLevel: 'info',
        })
    )
    // Enable logging of our requests, proxied and non-proxied
    app.use(morgan('dev'))
}

