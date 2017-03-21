import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, Breadcrumb, BreadcrumbItem, Button, Input, Alert } from 'reactstrap';

export default class ConfirmBooking extends Component {
	
	constructor(params) {
		super(params);
		this.book = this.book.bind(this);
		this.usernameChanged = this.usernameChanged.bind(this);
		this.passwordChanged = this.passwordChanged.bind(this);
		
		this.state = {
			facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0],
			time: new Date(this.props.params.time),
			room: this.props.params.room,
			isBooked : false,
			isBooking: false
		}
	}
	
	book() {
		let data = { date: this.state.time.toISOString(), fullName: "Luke", username: this.state.username, password: this.state.password };
		
		this.setState({
			isBooking: true
		});
		
		fetch(`/facility/glass-rooms/room/${this.state.room}/book`, {
			method: 'post',
			body: JSON.stringify(data),
			headers: {'Content-Type': 'application/json'}
		}).then(response => response.text())
		.then(text => {
			if(text === "success") {
				this.setState({
					isBooked: true,
					isBooking: false
				});
			} else {
				let [title, message] = text.split('\n');
				this.setState({
					errorTitle: title,
					errorMessage: message,
					isBooking: false
				});
			}
		}).catch(error => this.setState({isBooking: false}));
	}
	
	usernameChanged(e) {
		this.setState({username: e.target.value});
	}
	
	passwordChanged(e) {
		this.setState({password: e.target.value});
	}
	
	render() {
		let timeOptions = { hour: "2-digit", minute: "2-digit" };
		let timeLabel = this.state.time.toLocaleString('en-GB', timeOptions);
		
		let dateOptions = { weekday: "short", day: "numeric", month: "long" };
		let dateLabel = this.state.time.toLocaleString('en-GB', dateOptions);
		
		let breadcrumbDateLabel = this.state.time.toLocaleString('en-GB', {...timeOptions, ...dateOptions});
		
		var bottom;
		
		if(this.state.errorTitle) {
			bottom = (
				<Alert color="danger">
				  <strong>{this.state.errorTitle}</strong>
				  <br/>
				  {this.state.errorMessage}
				</Alert>
			);
		} else if(this.state.isBooked) {
			bottom = (
				<Alert color="success">
				  <strong>Booking confirmed.</strong> An email has been sent to asdf@tcd.ie
				</Alert>
			);
		} else {
			bottom = (
				<div>
					<Input type="text" placeholder="username" onChange={this.usernameChanged}/>
					<br/>
					<Input type="password" placeholder="password" onChange={this.passwordChanged}/>
					<br/>
					<Button color="primary" onClick={this.book} disabled={this.state.isBooking}>
						{this.state.isBooking ? "Booking..." : "Book now"}
					</Button>
				</div>
			);
		}

		return (
			<Container>
				<Breadcrumb>
					<BreadcrumbItem tag={Link} to="/">Home</BreadcrumbItem>
					<BreadcrumbItem tag={Link} to={`/${this.state.facility.getURLName()}`}>{this.state.facility.name}</BreadcrumbItem>
					<BreadcrumbItem tag={Link} to={`/${this.state.facility.getURLName()}/${this.state.time.toUTCString()}`}>{breadcrumbDateLabel}</BreadcrumbItem>
					<BreadcrumbItem active>Room {this.state.room}</BreadcrumbItem>
				</Breadcrumb>
				<h1 className="text-center display-3">{timeLabel}</h1>
				<h3 className="text-center">{dateLabel}</h3>
				<h4 className="text-center">Room {this.state.room} @ {this.state.facility.name}</h4>
				{bottom}
			</Container>
		);
	}
}