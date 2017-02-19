import React, { Component } from 'react';
import { Col, Card, CardTitle, CardSubtitle, CardImg, CardImgOverlay } from 'reactstrap';

export default class Facility extends Component {

  render() {
    return (
        <Col xs='12' lg='3'>
          <a role='button' onClick={() => alert('foo')}>
            <Card inverse>
              <CardImg height='200px' style={{objectFit: 'cover'}} src={this.props.image}/>
              <CardImgOverlay>
                <CardTitle>{this.props.name}</CardTitle>
                <CardSubtitle>3 rooms free</CardSubtitle>
              </CardImgOverlay>
            </Card>
          </a>
        </Col>
    );
  }

}
