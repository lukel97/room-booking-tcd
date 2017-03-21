import React, { Component } from 'react';
import { Card, CardHeader, CardText, CardBlock,
  CardTitle, CardSubtitle, Button } from 'reactstrap';	// need to import other stuff i'd say

export default class Bookings extends Component {

	constructor(params) {
		super(params);
    	this.state = {
	    facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0], // dont know whats going on here
	    rooms: []
    };
    
	let username = encodeURIComponent("macfhlar&");
	let password = encodeURIComponent("Rossmore12!");	// Will need to update this to get user's password + username

    
    fetch("/facility/glass-rooms/bookings" + username + password, { method: "get" })	// double check this is done correctly
    	.then(response => response.json())
    	.then(rooms =>
	    	this.setState({
		    	rooms: rooms
	    	})
    	, error => console.log);
	}

  render() {
  	let rooms = this.state.rooms.map(room =>
			<Card className="mt-4" key={room.roomNumber}>
				<CardBlock>
					<CardTitle>Room {room.roomNumber}</CardTitle>
					<Button> Cancel</Button>  // need to incorporate cancel function
				</CardBlock>
			</Card>
		);

    return (
      <div>
      	{rooms}
      </div>
    );
  }

}
