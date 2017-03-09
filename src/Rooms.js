import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, Breadcrumb, BreadcrumbItem, CardColumns, Card, CardBlock, CardTitle, CardSubtitle, CardText, Button } from 'reactstrap';

export default class Bookings extends Component {
	
  constructor(params) {
	super(params);
    this.state = {
	    facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0],
	    time: new Date(this.props.params.time),
	    rooms: []
    };
    
	let queryParams = "?date=" + encodeURIComponent(this.state.time.toISOString());
    
    fetch("/facility/glass-rooms/" + queryParams, { method: "get" })
    	.then(response => response.json())
    	.then(rooms => 
    	  rooms.map(room => {
	    	//Filter the bookings to just bookings at the speicifed date
    		room.bookings = room.bookings.map(booking => new Date(booking))
    						.filter(booking => booking.getTime() === this.state.time.getTime());
    		return room;
    	  }).filter(room => room.bookings.length === 0))	//And only show rooms with no bookings
    	  .then(rooms =>
	    	this.setState({
		    	rooms: rooms
	    	})
    	, error => console.log);
  }

  	render() {
		let breadcrumbDate = this.state.time.toLocaleString('en-GB', {
		  weekday: "short",
		  day: "numeric",
		  month: "long",
		  hour: "2-digit",
		  minute: "2-digit"
		});
		
		let rooms = this.state.rooms.map(room =>
			<Card className="mt-4" key={room.roomNumber}>
				<CardBlock>
					<CardTitle>Room {room.roomNumber}</CardTitle>
					<CardSubtitle>Fits {room.capacity} people</CardSubtitle>
					<CardText>Contains 2 flipboards and TV</CardText>
					<Button tag={Link} to={`/${this.state.facility.getURLName()}/${this.props.params.time}/${room.roomNumber}`}>Book</Button>
				</CardBlock>
			</Card>
		);
	  
		return (
		  <Container>
				<Breadcrumb>
					<BreadcrumbItem tag={Link} to="/">Home</BreadcrumbItem>
					<BreadcrumbItem tag={Link} to={`/${this.state.facility.getURLName()}`}>{this.state.facility.name}</BreadcrumbItem>
					<BreadcrumbItem active>{breadcrumbDate}</BreadcrumbItem>
				</Breadcrumb>
				<CardColumns>
					{rooms}
				</CardColumns>
		  </Container>
		);
	}

}
