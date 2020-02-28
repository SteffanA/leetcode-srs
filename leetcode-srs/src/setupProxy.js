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
                host: 'localhost',
                protocol: 'http:',
                port: 5000,
            },
            secure: false,
            changeOrigin: true,
            logLevel: 'info',
        })
    )
    app.use(morgan('dev'))
}

