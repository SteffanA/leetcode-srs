import axios from 'axios'

const instance = axios.create({
    //TODO: Debug this so we can use always qw/ base url
    // baseURL: process.env.REACT_APP_API_URL + ':' + process.env.REACT_APP_API_PORT + '/api'
})

// TODO: If this doesn't work delete it
if ((process.env.NODE_ENV === 'development')) {
  instance.interceptors.request.use(function (config) {
      // Do something before request is sent
      console.log('Intercepted axios request is: ')
      console.log(config)
      return config;
    }, function (error) {
      // Do something with request error
      return Promise.reject(error);
    });
}

export default instance;