import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import {BrowserRouter as Router} from 'react-router-dom'
import thunk from 'redux-thunk'
import {authReducer} from './store/reducers/auth'
import {listReducer} from './store/reducers/lists'
import {problemReducer} from './store/reducers/problems'

//TODO: Use the dotenv-webpack plugin to utilize a webpack for environ vars in this project
const rootReducer = combineReducers({
  auth: authReducer,
  lists: listReducer,
  problems: problemReducer,
})

const composeEnhancers = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })) 
    || compose;

const store = createStore(rootReducer, composeEnhancers(
    applyMiddleware(thunk)
))

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <App className="bg-grey-lighter"/>
        </Router>
    </Provider>
, document.getElementById('root'));