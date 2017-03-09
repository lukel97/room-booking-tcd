import React, { Component } from 'react';
import { Card, CardHeader, CardText, CardBlock,
  CardTitle, CardSubtitle, Button } from 'reactstrap';

export default class Bookings extends Component {

	constructor(params) {
		super(params);

		this.state ={
			bookings: ["one", "two"],
      rooms: ["Room 3: Hamilton Glassrooms", "Room 7: Berkely Library"]

		};
	}

  render() {

  	var cards = [];
  	for(var i = 0; i < this.state.bookings.length; i++) {
  		cards.push(<Card>
        <CardHeader>{this.state.rooms[i]}</CardHeader>
        <CardBlock>
          <CardTitle>{this.state.bookings[i]}</CardTitle>
          <CardSubtitle>Card subtitle</CardSubtitle>
          <CardText>Some quick example text to build on the card title and make up the bulk of the card's content.</CardText>
          <Button>Cancel Booking</Button>
        </CardBlock>
      </Card>);
  	}

    return (
      <div>
      	{cards}
      </div>
    );
  }

}
