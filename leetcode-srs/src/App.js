import React, {Fragment, useEffect} from 'react';
import { Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import PrivateRoute from './containers/SharedItems/PrivateRoute'
import './App.css';

import MainPage from './containers/MainPage/MainPage';
import Navbar from './containers/SharedItems/Navbar'
import Auth from './containers/Modals/Login/Auth'
import Logout from './containers/Auth/Logout'
import ListEditor from './containers/ListEditor/ListEditor'
import ListsViewer from './containers/ListsViewer/ListsViewer'

import * as actions from './store/actions/index'

/*
For debugging, try using this chrome build:
chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security --ignore-certificate-errors
*/

const App = props => {
  // Deconstruct props as required
  const {
    isAuth,
    onTryAutoSignIn
  } = props

  // Try to login automatically on page load. Only run once
  useEffect(() => {
    if (!isAuth) {
      onTryAutoSignIn()
    }
  }, [isAuth, onTryAutoSignIn])

  return (
    <Fragment>
      <Navbar />
      <Route exact path="/" component={MainPage} />
      <section className="container">
        <Switch>
          <Route exact path="/auth" component={Auth} />
          <Route exact path="/logout" component={Logout} />
          <PrivateRoute exact path="/manage-lists" component={ListEditor} />
          <Route exact path="/view-public-lists" component={ListsViewer}/>
          {/* Land any random URL on a page w/ Navbar*/}
          <Route path="/" component={null}/>
        </Switch>
      </section>
    </Fragment>
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
