import React, { Component } from 'react';
import { Container, Row, Col, Card, CardTitle, CardSubtitle, CardImg, CardImgOverlay } from 'reactstrap';
import { Link } from 'react-router';

export default class Facilities extends Component {

  render() {
    return (
      <Container>
        <Row className='mt-4'>
          {this.props.route.facilities.map(f =>
            <FacilityCard key={f.name} facility={f}/>
          )}
        </Row>
      </Container>
    );
  }

}

export class Facility {
  constructor(name, image) {
    this.name = name;
    this.image = image;
  }
  
  getURLName() {
    return this.name.replace(/\s+/g, '-').toLowerCase();
  }
  
  getFreeRoomCount(date = new Date()) {
    let queryParams = `?date=${encodeURIComponent(date.toISOString())}`;
    return fetch(`/facility/${this.getURLName()}/availableTimes${queryParams}`, { method: "get" })
      .then(response => response.json())
      .then(rooms => 
        rooms.map(room => {
          //Filter the bookings to just bookings at the speicifed date
          room.availableTimes = room.availableTimes.map(time => new Date(time))
                  .filter(time => time.getTime() === date.getTime());
          return room;
        })
        .filter(room => room.availableTimes.length > 0)//And only show rooms with free slots
        .length);
  }
}

class FacilityCard extends Component {

  constructor(params) {
    super(params);
    this.state = {
      freeRoomsLabel: ""
    };
  }

  componentDidMount() {
    this.props.facility.getFreeRoomCount().then(count => {
      this.setState({
        freeRoomsLabel: `${count} rooms free`
      });
      console.log(count);
    }).catch(console.log);
  }

 render() {
    return (
        <Col xs='12' lg='3'>
          <Link to={this.props.facility.getURLName()} >
            <Card inverse>
              <CardImg height='200px' style={{objectFit: 'cover'}} src={this.props.facility.image}/>
              <CardImgOverlay>
                <CardTitle>{this.props.facility.name}</CardTitle>
                <CardSubtitle>{this.state.freeRoomsLabel}</CardSubtitle>
              </CardImgOverlay>
            </Card>
          </Link>
        </Col>
    );
  }

}
