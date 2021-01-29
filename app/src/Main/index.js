import React, { Component } from 'react';
import { Switch, Route, } from 'react-router-dom'

import Login from '../Login'
import Home from '../Home'

class Main extends Component {
  render() {
    return (
      <main>
        <Security 
          redirect_uri={'http://localhost:3000/implicit/callback'}
          scope={['openid', 'profile', 'email']}>
          
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/implicit/callback" component={ImplicitCallback} />
            <SecureRoute path="/home" component={Home} />
          </Switch>
        </Security>
      </main>
    );
  }
}

export default Main;