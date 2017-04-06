// Issue no.1: Getting the users password + email to check their booking
// Issue no.2: Getting the booking for glassrooms -> getting booking for the rest
// Issue no.3: Cancelling for glassrooms -> gcancelling the rest

import React, { Component } from 'react';
import { Container, Form, Card, CardText, CardBlock, CardTitle, Button, Alert, Input, FormGroup } from 'reactstrap';	// need to import other stuff i'd say

export default class Bookings extends Component {

	constructor(params) {
		super(params);
    	this.state = {
		    facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0],
		    isFetching: false
	    };
	    
	    this.cancelBooking = this.cancelBooking.bind(this);

		this.usernameChanged = this.usernameChanged.bind(this);
		this.passwordChanged = this.passwordChanged.bind(this);

	}


	cancelBooking(roomNumber){
		let username = encodeURIComponent(this.state.username);		// Using mine for now to test if it is working
		let password = encodeURIComponent(this.state.password);	// Will need to update this to get user's password + username


		let newRooms = this.state.rooms;
		newRooms.filter(r => r.roomNumber === roomNumber)[0].isCancelling = true
		this.setState({
			rooms: newRooms
		});

		fetch("/facility/glass-rooms/room/" + roomNumber + "/cancel?username=" + username + "&password=" + password, { method: "post" })
			.then(response => response.text())
			.then(text => {
				if(text === "success"){
					let newRooms = this.state.rooms;
					newRooms.filter(r => r.roomNumber === roomNumber)[0].isCancelled = true
					this.setState({
						rooms: newRooms
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
  		let getBookings = (event) => {
			event.preventDefault();
			this.setState({isFetching: true});
			fetch("/facility/glass-rooms/bookings?username=" + this.state.username + "&password=" + this.state.password, { method: "get" })	// double check this is done correctly
			.then(response => response.json())
			.then(rooms =>
				this.setState({
					rooms: rooms,
					isFetching: false
				})
				, error => console.log);
		};
		
		
  		var content;
  		if(this.state.rooms != null) {
  			if(this.state.rooms.length <= 0) {
  				content = (	<Alert color="info">
								<strong>No bookings found</strong>
								<br/>
								Make one from <a href="/glass-rooms">here.</a>
							</Alert>);
  			} else {
  				let profile = this.props.auth2.currentUser.get().getBasicProfile();
				content = this.state.rooms.map(room => {
					if(room.isCancelled) {
						
						return (<Alert color="success" key={`cancelSuccess${room.roomNumber}`}>
									<strong>Cancel successful</strong>
									<br/>
									An email has been sent to {profile.getEmail()}
								</Alert>);
					}
								
					let bookingDate = new Date(room.bookings[0]);
					let options = { weekday: "long", day: "numeric", month: "long",hour: "2-digit", minute: "2-digit"};
					let dateString = bookingDate.toLocaleString('en-GB', options);
					var buttonText = room.isCancelling ? "Cancelling..." : "Cancel";
					var buttonDisabled = room.isCancelling;
					return (
						<Card className="mt-4" key={room.roomNumber}>
							<CardBlock>
							<CardTitle>Room {room.roomNumber}</CardTitle>
								<CardText>Booked for {dateString}</CardText>
								<Button onClick={() => {
									this.cancelBooking(room.roomNumber);
								}} disabled={buttonDisabled}>{buttonText}</Button>  
							</CardBlock>
						</Card>);
				});
			}
		} else {
			content = (
				<Form onSubmit={getBookings}>
					<FormGroup>
					<Input type="text" placeholder="SCSS username" onChange={this.usernameChanged}/>
					</FormGroup>
					<FormGroup>
					<Input type="password" placeholder="SCSS password" onChange={this.passwordChanged}/>
					</FormGroup>
					<FormGroup>
						<Button type="submit" disabled={this.state.isFetching}>
							{this.state.isFetching ? "Fetching..." : "Fetch bookings"}
						</Button>
					</FormGroup>
				</Form>
			);
		}
		return (
     		<Container>
     			<h2>Glass Room Bookings</h2>
     			<br/>
      			{content}
      			<br/>
				<Alert color="info">
					<strong>Looking for your BLU/Hamilton/John Stearne bookings?</strong>
					<br/>
					You can cancel them via the link sent to your email address.
				</Alert>
      		</Container>
    	);
  }
}

// How to get the time with room?
// Do I have to reset state success to null + initialise it in the constructor
// timed cancel




