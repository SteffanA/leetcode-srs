import React, {Fragment, useEffect} from 'react';
import { Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import './App.css';

import MainPage from './containers/MainPage/MainPage';
import Navbar from './containers/SharedItems/Navbar'
import Auth from './containers/Auth/Auth'

import * as actions from './store/actions/index'

/*
For debugging, try using this chrome build:
chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security --ignore-certificate-errors
*/

const App = props => {
  // Try to login automatically on page load. Only run once
  useEffect(() => {
    props.onTryAutoSignIn()
  }, [])

  return (
    // {/* <Provider store={store}> */}
      <Fragment>
        <Navbar />
        <Route exact path="/" component={MainPage} />
        <section className="container">
          {/* <Alert />*/}
          <Switch>
            <Route exact path="/auth" component={Auth} />
            {/*
            <PrivateRoute exact path="/create-list" component={ListBuilder} />
          */}
          </Switch>
        </section>
      </Fragment>
    // </Provider> 
  );
}

// The mapping of state/dispatch are for app-wide access to variables
// For now, we just care about auth state app-wide and convience logging in user w/ token stored
const mapStateToProps = state => {
  return {
    isAuth: state.auth.token !== null,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignIn: () => dispatch(actions.checkAuthState()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
