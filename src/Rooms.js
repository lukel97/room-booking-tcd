import React, { Component } from 'react';
import { Container, ListGroup, ListGroupItem } from 'reactstrap';

export default class Bookings extends Component {
	
  constructor(params) {
	super(params);
    this.state = {
	    facility: this.props.params.facility,
	    time: this.props.params.time
    };
  }

  render() {
	return (
	  <Container>
	  	<h3 className='mt-4'>{this.state.facility} rooms available at {this.state.time}:00</h3>
	  	<ListGroup className='mt-4'>
	  		<ListGroupItem>asf</ListGroupItem>
	  	</ListGroup> 
	  </Container>
	)
  }

}
