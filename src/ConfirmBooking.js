import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, Breadcrumb, BreadcrumbItem, Jumbotron, Button, Input } from 'reactstrap';

export default class ConfirmBooking extends Component {
	
	constructor(params) {
		super(params);
		this.book = this.book.bind(this);
		this.usernameChanged = this.usernameChanged.bind(this);
		this.passwordChanged = this.passwordChanged.bind(this);
		
		this.state = {
			facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0],
			time: new Date(this.props.params.time),
			room: this.props.params.room
		}
	}
	
	book() {
		let data = { date: this.state.time.toISOString(), fullName: "Luke", username: this.state.username, password: this.state.password };
		
		fetch(`/facility/glass-rooms/room/${this.state.room}/book`, {
			method: 'post',
			body: JSON.stringify(data),
			headers: {'Content-Type': 'application/json'}
		}).then(console.log);
	}
	
	usernameChanged(e) {
		this.setState({username: e.target.value});
	}
	
	passwordChanged(e) {
		this.setState({password: e.target.value});
	}
	
	render() {
		let dateOptions = {
			weekday: "short",
			day: "numeric",
			month: "long",
			hour: "2-digit",
			minute: "2-digit"
		};
		
		let timeLabel = this.state.time.toLocaleString('en-GB', dateOptions);
		return (
			<Container>
				<Breadcrumb>
					<BreadcrumbItem tag={Link} to="/">Home</BreadcrumbItem>
					<BreadcrumbItem tag={Link} to={`/${this.state.facility.getURLName()}`}>{this.state.facility.name}</BreadcrumbItem>
					<BreadcrumbItem tag={Link} to={`/${this.state.facility.getURLName()}/${this.state.time.toUTCString()}`}>{timeLabel}</BreadcrumbItem>
					<BreadcrumbItem active>Room {this.state.room}</BreadcrumbItem>
				</Breadcrumb>
				<Jumbotron>
					<h1>Confirm booking</h1>
					<h3>Room {this.state.room} @ {timeLabel}</h3>
					<Input type="text" placeholder="username" onChange={this.usernameChanged}/>
					<br/>
					<Input type="password" placeholder="password" onChange={this.passwordChanged}/>
					<br/>
					<Button color="primary" onClick={this.book}>Book now</Button>
				</Jumbotron>
			</Container>
		);
	}
}