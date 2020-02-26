import React, {Fragment} from 'react';
import './App.css';
import MainPage from './containers/MainPage/MainPage';
import Navbar from './containers/SharedItems/Navbar'
import { Route } from 'react-router-dom'

function App() {
  return (
    // {/* <Provider store={store}> */}
      <Fragment>
        <Navbar />
        {/* <Route exact path="/" component={MainPage} /> */}
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
    // </Provider> 
  );
}

export default App;
