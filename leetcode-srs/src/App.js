import React, {useEffect} from 'react';
import { Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import PrivateRoute from './containers/SharedItems/PrivateRoute/PrivateRoute'
import classes from './App.module.css';

import MainPage from './containers/MainPage/MainPage';
import Navbar from './containers/SharedItems/NavBar/Navbar'
import Footer from './containers/SharedItems/Footer/Footer';
import Auth from './containers/Modals/Login/Auth'
import Logout from './containers/Logout/Logout'
import ListsManager from './containers/ListsManager/ListsManager';
import ListsViewer from './containers/ListsViewer/ListsViewer'
import SubmissionHistory from './containers/SubmissionHistory/SubmissionHistory'

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
    <div className='bg-gray-200 rounded-lg shadow-xl h-screen'>
      <Navbar />
      <Route exact path="/" component={MainPage} />
      <section className="container">
        <Switch>
          <Route exact path="/auth" component={Auth} />
          <Route exact path="/logout" component={Logout} />
          <PrivateRoute exact path="/manage-lists" component={ListsManager} />
          <Route exact path="/view-public-lists" component={ListsViewer}/>
          <PrivateRoute exact path="/submissions" component={SubmissionHistory} />
          {/* Land any random URL on a page w/ Navbar*/}
          <Route path="/" component={null}/>
        </Switch>
      </section>
      <Footer/>
    </div>
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
