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
  constructor(name, image, requiresSCSSLogin = false) {
    this.name = name;
    this.image = image;
    this.requiresSCSSLogin = requiresSCSSLogin;
  }
  
  getURLName() {
    return this.name.replace(/\s+/g, '-').toLowerCase();
  }
  
  getFreeRoomCount(date = new Date()) {
    //Floor to hour
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    //Get the next hour
    date.setTime(date.getTime() + 1000 * 60 * 60 * 1);
    
    let queryParams = `?date=${encodeURIComponent(date.toISOString())}`;
    return fetch(`/facility/${this.getURLName()}/availableTimes${queryParams}`, { method: "get" })
      .then(response => response.json())
      .then(rooms => {
        rooms.map(room => room.availableTimes.map(time => new Date(time))).forEach(console.log);
        return rooms.filter(room => room.availableTimes.filter(time => new Date(time).getTime() === date.getTime()).length > 0);
      })
      .then(availableRooms => availableRooms.length);
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
    }).catch(console.log);
  }

 render() {
    return (
        <Col xs='12' lg='3'>
          <Link to={this.props.facility.getURLName()} >
            <Card inverse>
              <CardImg height='200px' style={{objectFit: 'cover', filter: 'brightness(70%)'}} src={this.props.facility.image}/>
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
