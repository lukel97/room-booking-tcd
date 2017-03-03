import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, Breadcrumb, BreadcrumbItem, CardGroup, Card, CardBlock, CardTitle, CardSubtitle, CardText, Button } from 'reactstrap';

export default class Bookings extends Component {
	
  constructor(params) {
	super(params);
    this.state = {
	    facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0]
    };
  }

  render() {
	  let time = new Date(this.props.params.time);
	  let breadcrumbDate = time.toLocaleString('en-GB', {
		  weekday: "short",
		  day: "numeric",
		  month: "long",
		  hour: "2-digit",
		  minute: "2-digit"
	  });
	  
	  
	return (
	  <Container>
		  <Breadcrumb>
			<BreadcrumbItem tag={Link} to="/">Home</BreadcrumbItem>
			<BreadcrumbItem tag={Link} to={`/${this.state.facility.getURLName()}`}>{this.state.facility.name}</BreadcrumbItem>
			<BreadcrumbItem active>{breadcrumbDate}</BreadcrumbItem>
		  </Breadcrumb>
			<CardGroup>
				<Card className="mt-4">
					<CardBlock>
						<CardTitle>Room 3</CardTitle>
						<CardSubtitle>Fits 4 people</CardSubtitle>
						<CardText>Contains 2 flipboards and TV</CardText>
						<Button>Book</Button>
					</CardBlock>
				</Card>
				<Card className="mt-4">
					<CardBlock>
						<CardTitle>Room 4</CardTitle>
						<CardSubtitle>Fits 6 people</CardSubtitle>
						<CardText>Contains 2 flipboards and TV</CardText>
						<Button>Book</Button>
					</CardBlock>
				</Card>
				<Card className="mt-4">
					<CardBlock>
						<CardTitle>Room 7</CardTitle>
						<CardSubtitle>Fits 6 people</CardSubtitle>
						<CardText>Contains 2 flipboards and TV</CardText>
						<Button>Book</Button>
					</CardBlock>
				</Card>
			</CardGroup>
	  </Container>
	)
  }

}
