import React, { Component } from 'react';
import { Container, Row, Col, Card, CardTitle, CardSubtitle, CardImg, CardImgOverlay } from 'reactstrap';
import { Link } from 'react-router';

export default class Facilities extends Component {
  constructor() {
    super();
    this.state = {
      facilities: [ { name: 'Glass Rooms', image: require('./img/berkeley.jpg') },
                    { name: 'Berkeley', image: require('./img/berkeley.jpg') },
                    { name: 'Hamilton', image: require('./img/berkeley.jpg') },
                    { name: 'John Stearne', image: require('./img/berkeley.jpg') } ]
    };
  }

  render() {
    return (
      <Container>
        <Row className='mt-4'>
          {this.state.facilities.map(f =>
            <Facility key={f.name} name={f.name} image={f.image}/>
          )}
        </Row>
      </Container>
    );
  }

}

class Facility extends Component {

 render() {
    return (
        <Col xs='12' lg='3'>
          <Link to={this.props.name.replace(/\s+/g, '-').toLowerCase() }>
            <Card inverse>
              <CardImg height='200px' style={{objectFit: 'cover'}} src={this.props.image}/>
              <CardImgOverlay>
                <CardTitle>{this.props.name}</CardTitle>
                <CardSubtitle>3 rooms free</CardSubtitle>
              </CardImgOverlay>
            </Card>
          </Link>
        </Col>
    );
  }

}
