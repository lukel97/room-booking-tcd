import React, { Component } from 'react';
import { Jumbotron, Button } from 'reactstrap';

export default class ConfirmBooking extends Component {
	render() {
		return (
			<Jumbotron>
				<h1>Confirm booking</h1>
				<Button color="primary">Book now</Button>
			</Jumbotron>
		)
	}
}