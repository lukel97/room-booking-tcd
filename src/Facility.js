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
}

class FacilityCard extends Component {

 render() {
    return (
        <Col xs='12' lg='3'>
          <Link to={this.props.facility.getURLName()} >
            <Card inverse>
              <CardImg height='200px' style={{objectFit: 'cover'}} src={this.props.facility.image}/>
              <CardImgOverlay>
                <CardTitle>{this.props.facility.name}</CardTitle>
                <CardSubtitle>3 rooms free</CardSubtitle>
              </CardImgOverlay>
            </Card>
          </Link>
        </Col>
    );
  }

}
