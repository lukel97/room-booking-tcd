import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import Timetable from './Timetable';
import Bookings from './Bookings';
import Header from './Header';
import Facilities from './Facility';

class App extends Component {
  render() {
    return (
      <div>
      <Header/>
      {this.props.children}
      </div>
    );
  }
}

render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Facilities}/>
      <Route path=':facility' component={Timetable}/>
      <Route path='bookings' component={Bookings}/>
    </Route>
  </Router>,
  document.getElementById('root')
);
