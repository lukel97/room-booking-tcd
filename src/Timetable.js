import React, { Component } from 'react';
import { Container, ListGroup, ListGroupItem, Nav, NavItem, NavLink } from 'reactstrap';

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
    let now = new Date();
    let options = { weekday: 'short', day: 'numeric' };
    let week = [...Array(14).keys()].map(i => {
      let date = new Date();
      date.setDate(now.getDate() + i);
      return date;
    });

    const scrollableStyle = {
      overflowX: 'scroll',
      whiteSpace: 'nowrap'
    };
    
    const noHorizontalPadding = {
      paddingLeft: '0',
      paddingRight: '0'
    };

    return (
      <Container>
        <h3 className='mt-4'>{this.props.params.facility}</h3>
        
        <ListGroup className='mt-4'>
          <ListGroupItem style={noHorizontalPadding}>
            <Nav pills style={scrollableStyle}>
              <NavItem>
                <NavLink href="#">Calendar</NavLink>
              </NavItem>
              {
                week.map(date => {
                  var label;
                  switch(date.getDate()) {
                    case now.getDate():
                      label = "Today";
                      break;
                    case now.getDate() + 1:
                      label = "Tomorrow";
                      break;
                    default:
                      label = date.toLocaleString('en-US', options);
                  }
                  return (<NavItem>
                    <NavLink href="#" active={date.getDate() === now.getDate()}>{label}</NavLink>
                  </NavItem>);
                })
              }
            </Nav>
          </ListGroupItem>
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
