import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import Timetable from './Timetable';
import Bookings from './Bookings';
import Header from './Header';
import Facilities, { Facility } from './Facility';
import Rooms from './Rooms';
import ConfirmBooking from './ConfirmBooking';

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
			auth2: null,
			isSignedIn: false
		};

		this.signOut = this.signOut.bind(this);
  }
  
  componentDidMount() {
    
    ((d, s, id, cb) => {
      
      //Insert Google login script
      const element = d.getElementsByTagName(s)[0];
      const fjs = element;
      let js = d.createElement(s);
      js.id = id;
      js.src = '//apis.google.com/js/client:platform.js';
      fjs.parentNode.insertBefore(js, fjs);
      js.onload = cb;
      
    })(document, 'script', 'google-login', () => {
      
      //Load the auth2 module
      window.gapi.load('auth2', () => {
        
        //Init it if not already
        if (!window.gapi.auth2.getAuthInstance()) {
          window.gapi.auth2.init({
            client_id: '495799513982-tpkrc290lcs3c02s1e1d0s8vdosp9n38.apps.googleusercontent.com',
            hosted_domain: 'tcd.ie',
            scope: 'profile'
          });
        }
        
		this.setState({
			auth2: window.gapi.auth2.getAuthInstance()
		});
		
		window.gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => {
			this.setState({
				isSignedIn: isSignedIn
			});
		});
		
      });
    });
  }
	
	signOut() {
    	this.state.auth2.signOut();
 	}

	render() {
		return (
			<div>
				<Header isSignedIn={this.state.isSignedIn}
						signOut={this.signOut}/>
				{ this.props.children && React.cloneElement(this.props.children, {
					auth2: this.state.auth2, 
					isSignedIn: this.state.isSignedIn
				}) }
			</div>
		);
	}
}
                      
const facilities = [new Facility("Glass Rooms", require("./img/glassRooms.jpg"), {lat: 53.343502, lng: -6.250462}, true),
                    new Facility("Berkeley", require("./img/berkeley.jpg"), {lat: 53.343567, lng: -6.255924}),
                    new Facility("Hamilton", require("./img/hamilton.jpg"), {lat: 53.343057, lng: -6.250519}),
                    new Facility("John Stearne", require("./img/johnStearne.jpg"), {lat: 53.343646, lng: -6.247580})];

render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Facilities} facilities={facilities}/>
	  <Route path='bookings' component={Bookings} facilities={facilities}/>
	  <Route path=':facility/:time' component={Rooms} facilities={facilities}/>
	  <Route path=":facility/:time/:room" component={ConfirmBooking} facilities={facilities}/>
	  <Route path=':facility' component={Timetable} facilities={facilities}/>
    </Route>
  </Router>,
  document.getElementById('root')
);
