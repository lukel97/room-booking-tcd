import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, Jumbotron, Breadcrumb, BreadcrumbItem, Form, FormGroup, Button, Input, Alert } from 'reactstrap';

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
		let auth2 = window.gapi.auth2.getAuthInstance();
		if(!auth2.isSignedIn.get())
			return false;
			
		let profile = auth2.currentUser.get().getBasicProfile();
		
		let data = { 	date: this.state.time.toISOString(),
						username: this.state.username,
						password: this.state.password,
						email: profile.getEmail(),
						givenName: profile.getGivenName(),
						familyName: profile.getFamilyName(),
						fullName: profile.getName()
					};
		
		this.setState({
			isBooking: true
		});
		
		fetch(`/facility/${this.state.facility.getURLName()}/room/${this.state.room}/book`, {
			method: 'post',
			body: JSON.stringify(data),
			headers: {'Content-Type': 'application/json'}
		}).then(response => response.json())
		.then(response => {
			if(response.success) {
				this.setState({
					isBooked: true,
					isBooking: false,
					confirmationMessage: `An email has been sent to ${profile.getEmail()}.`
				});
			} else {
				let [title, message] = response.message.split('\n');
				this.setState({
					errorTitle: title,
					errorMessage: message,
					isBooking: false
				});
			}
		}).catch(error => this.setState({isBooking: false}));
		
		return false;	//Prevents page redirect
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
				  <strong>Booking confirmed.</strong>
				  {this.state.confirmationMessage}
				</Alert>
			);
		} else {
			
			let scssLogin = this.state.facility.requiresSCSSLogin ?
				(<div>
					<FormGroup>
						<Input type="text" placeholder="username" onChange={this.usernameChanged}/>
					</FormGroup>
					<FormGroup>
						<Input type="password" placeholder="password" onChange={this.passwordChanged}/>
					</FormGroup>
				</div>)
				: null;
			
			bottom = (
				<Form className="pull-right">
					{scssLogin}
					<FormGroup>
						<Button color="primary" onClick={this.book} disabled={this.state.isBooking}>
							{this.state.isBooking ? "Booking..." : "Book now"}
						</Button>
					</FormGroup>
				</Form>
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
				<Jumbotron>
					<h1 className="display-3">{timeLabel}</h1>
					<h3>{dateLabel}</h3>
					<h5>Room {this.state.room} @ {this.state.facility.name}</h5>
					{bottom}
				</Jumbotron>
			</Container>
		);
	}
}