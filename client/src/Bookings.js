// Issue no.1: Getting the users password + email to check their booking
// Issue no.2: Getting the booking for glassrooms -> getting booking for the rest
// Issue no.3: Cancelling for glassrooms -> gcancelling the rest

import React, { Component } from 'react';
import { Card, CardText, CardBlock, CardTitle, Button, Alert, Input, FormGroup } from 'reactstrap';	// need to import other stuff i'd say

export default class Bookings extends Component {

	constructor(params) {
		super(params);
    	this.state = {
		    facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0], 
		    rooms: [],
		    alertMessage: "null"
	    };
	    
	    this.cancelBooking = this.cancelBooking.bind(this);

		this.usernameChanged = this.usernameChanged.bind(this);
		this.passwordChanged = this.passwordChanged.bind(this);

	}


	cancelBooking(roomNumber){
		let username = encodeURIComponent(this.state.username);		// Using mine for now to test if it is working
		let password = encodeURIComponent(this.state.password);	// Will need to update this to get user's password + username

		fetch("/facility/glass-rooms/room/" + roomNumber + "/cancel?username=" + username + "&password=" + password, { method: "post" })
			.then(response => response.text())
			.then(text => {
				if(text === "success"){
					this.setState({
						rooms: this.state.rooms.filter(r => r.roomNumber !== roomNumber),
						alertMessage: "success"
					});
				}
			});
	}

	usernameChanged(e) {
		this.setState({username: e.target.value});
	}
	
	passwordChanged(e) {
		this.setState({password: e.target.value});
	}

  render() {
  	let rooms = this.state.rooms.map(room => {
  			let bookingDate = new Date(room.bookings[0]);
  			let options = { weekday: "long", day: "numeric", month: "long",hour: "2-digit", minute: "2-digit"};
  			let dateString = bookingDate.toLocaleString('en-GB', options);
  			return (
				<Card className="mt-4" key={room.roomNumber}>
				
					<CardBlock>
					<CardTitle>Room {room.roomNumber}</CardTitle>
						<CardText>Booked for {dateString}</CardText>
						<Button onClick={() => {
									this.cancelBooking(room.roomNumber);
							}}>Cancel</Button>  
					</CardBlock>
				</Card>);
		});

		let getBookings = () => fetch("/facility/glass-rooms/bookings?username=" + this.state.username + "&password=" + this.state.password, { method: "get" })	// double check this is done correctly
			.then(response => response.json())
			.then(rooms =>
				this.setState({
					rooms: rooms
				})
				, error => console.log);

		var bottom;
		if(this.state.alertMessage === "success"){
			bottom = (
				<Alert color="success">
				<strong>Cancel Successfull.</strong> An email has been sent to testEmail@tcd.ie
				</Alert>
			);
		}
		return (
      <div>
			<FormGroup>
			<Input type="text" placeholder="username" onChange={this.usernameChanged}/>
			</FormGroup>
			<FormGroup>
			<Input type="password" placeholder="password" onChange={this.passwordChanged}/>
			</FormGroup>
			<Button onClick={getBookings}>Login</Button>
      	{bottom}
      	{rooms}
				<Alert color="info">
					<strong>Looking for your BLU/Hamilton/John Stearne bookings?</strong>
					You can cancel them via the link sent to your email address.
				</Alert>
      </div>
    );
  }
}

// How to get the time with room?
// Do I have to reset state success to null + initialise it in the constructor
// timed cancel




