import React, { Component } from 'react';
import { Container, ListGroup, ListGroupItem } from 'reactstrap';

export default class Timetable extends Component {
  
  constructor(props) {
    super(props);
    
    var times = Array(24);
    for(var i = 0; i < 24; i++)
      times[i] = `${i}:00`;
      
      this.state = {
        times: times
      };
  }
  
  render() {
    return (
      <Container>
        <h3 className='mt-4'>{this.props.params.facility}</h3>
        <ListGroup className='mt-4'>
          {
            this.state.times.map(x =>
              <ListGroupItem key={x}>{x}</ListGroupItem> 
            )
          }
        </ListGroup>
      </Container>
    )
  }

}
