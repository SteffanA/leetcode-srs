import React, {Fragment} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import logo from './logo.svg';
import './App.css';
import MainPage from './containers/MainPage/MainPage';
import Navbar from './containers/SharedItems/Navbar'


function App() {
  return (
    // {/* <Provider store={store}> */}
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path="/" component={MainPage} />
          <section className="container">
            {/* <Alert />
            <Switch>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path='/create-profile' component={CreateProfile} />
              <PrivateRoute exact path='/edit-profile' component={EditProfile} />
            </Switch> */}
          </section>
        </Fragment>
      </Router>
    // </Provider> 
  );
}

export default App;
