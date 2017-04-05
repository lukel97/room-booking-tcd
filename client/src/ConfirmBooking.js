import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, Jumbotron, Breadcrumb, BreadcrumbItem, Form, FormGroup, Button, Input, Alert } from 'reactstrap';
import GoogleMapReact from 'google-map-react';

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
	
	componentDidMount() {
		this.setState({isLoggedIn: window.gapi.auth2.getAuthInstance().isSignedIn.get()});
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
		
		let scssLogin = this.state.facility.requiresSCSSLogin ?
				(<div>
					<FormGroup>
						<Input type="text" placeholder="SCSS username" onChange={this.usernameChanged}/>
					</FormGroup>
					<FormGroup>
						<Input type="password" placeholder="SCSS password" onChange={this.passwordChanged}/>
					</FormGroup>
				</div>)
				: null;
		
		let form = (
				<Form>
					{scssLogin}
					<FormGroup>
						<Button type="submit" onClick={this.book} disabled={this.state.isBooking}>
							{this.state.isBooking ? "Booking..." : "Book now"}
						</Button>
					</FormGroup>
				</Form>
			);
		
		let bottom;
		
		if(this.state.errorTitle) {
			bottom = (
				<div>
					<Alert color="danger">
					  <strong>{this.state.errorTitle}</strong>
					  <br/>
					  {this.state.errorMessage}
					</Alert>
					{form}
				</div>
			);
		} else if(this.state.isBooked) {
			bottom = (
				<Alert color="success">
				  <strong>Booking confirmed.</strong>
				  <br/>
				  {this.state.confirmationMessage}
				</Alert>
			);
		} else if(!this.state.isLoggedIn) {
			bottom = (
				<Alert color="warning">
				  <strong>You must log in first.</strong>
				  <br/>
				  You can log into your tcd account from the menu in the navigation bar.
				</Alert>
			);
		} else {
			bottom = form;
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
					<h1 className="display-3 text-center">{timeLabel}</h1>
					<h3>{dateLabel}</h3>
					<h5>Room {this.state.room} @ {this.state.facility.name}</h5>
					<div style={{
						height: "200px",
						borderRadius: "0.3rem",
						overflow: "hidden",
						transform: "translate3d(0px, 0px, 0px)"
					}}>
					<GoogleMapReact
						defaultCenter={{lat: 53.343467, lng: -6.253183}}	//Cricket pitch
						defaultZoom={15}
						bootstrapURLKeys={{ key: "AIzaSyAvfntCB840n7-qmQLUIMkkedS1j-zQ9R4" }}
						onGoogleApiLoaded={({map, maps}) => {
							let options = {
								disableDefaultUI: true,
								draggable: false,
								zoomControl: false,
								scrollwheel: false
							};
							map.setOptions(options);
							new maps.Marker({
							  position: this.state.facility.location,
							  map: map,
							  title: this.state.facility.name
							});
						}}
						yesIWantToUseGoogleMapApiInternals
					/>
					</div>
					<br/>
					{bottom}
				</Jumbotron>
			</Container>
		);
	}
}