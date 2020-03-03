import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import {BrowserRouter as Router} from 'react-router-dom'
import thunk from 'redux-thunk'
import authReducer from './store/reducers/auth'
import listsReducer from './store/reducers/lists'

//TODO: Use the dotenv-webpack plugin to utilize a webpack for environ vars in this project
const rootReducer = combineReducers({
  auth: authReducer,
  lists: listsReducer,
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(thunk)
))

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <App />
        </Router>
    </Provider>
, document.getElementById('root'));