import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, ListGroup, ListGroupItem, Nav, NavItem, NavLink } from 'reactstrap';

function getTimesForDate(date) {
  var times = Array(24);
  for(var i = 0; i < 24; i++) {
    var time = new Date(date.getTime());
    time.setHours(i);
    time.setMinutes(0);
    time.setSeconds(0);
    times[i] = time;
  }
  
  return times;
}

export default class Timetable extends Component {
  
  constructor(props) {
    super(props);
    
    let now = new Date();
    
    this.state = {
      isCalendarOpen: false,
      currentDate: now,
      times: getTimesForDate(now)
    };
    
    this.openCalendar = this.openCalendar.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }
  
  openCalendar() {
    this.setState({
      isCalendarOpen: true
    });
  }
  
  changeDate(date) {
    this.setState({
      currentDate: date,
      times: getTimesForDate(date)
    });
  }
  
  render() {
    let now = new Date();
    let week = [...Array(14).keys()].map(i => {
      let date = new Date();
      date.setDate(now.getDate() + i);
      return date;
    });

    const scrollableStyle = {
      overflowX: 'scroll',
      whiteSpace: 'nowrap',
      paddingLeft: '0',
      paddingRight: '0'
    };
    
    const Timeslot = ({time}) => {
      let options = { hour: '2-digit', minute: '2-digit' };
      
      let label = time.toLocaleString('en-GB', options);
    
      return (<ListGroupItem tag={Link} to={`${this.props.params.facility}/${time.getHours()}`} action className="timeslot">
          <span className="time">{label}</span>
          <span className="roomsAvailable ml-4">3 rooms</span>
          <span className="ml-4">4💺 6💺</span>
          <span className="ml-4">📈📺</span>
      </ListGroupItem>);
    };

    return (
      <Container>
        <h3 className='mt-4'>{this.props.params.facility}</h3>
        
        <ListGroup className='mt-4'>
          <ListGroupItem style={scrollableStyle}>
            <Nav pills>
              <NavItem>
              {
                this.state.isCalendarOpen ? (
                  <NavLink>
                    <input type="date" placeholder="23/02"/>
                  </NavLink>
                ) : (
                  <NavLink href="#" onClick={this.openCalendar}>
                    Calendar
                  </NavLink>
                )
              }
                
              </NavItem>
              {
                week.map(date => 
                  <DateButton isActive={date.getDate() === this.state.currentDate.getDate()}
                              date={date}
                              now={now}
                              changeDate={this.changeDate}
                              key={date}/>
                )
              }
            </Nav>
          </ListGroupItem>
          {
            this.state.times.map(x =>
              <Timeslot time={x} key={x.getHours()}/>
            )
          }
          
        </ListGroup>
      </Container>
    )
  }
}

class DateButton extends Component {
  
  constructor(props) {
    super(props);
    
    this.onClick = this.onClick.bind(this);
  }
  
  onClick() {
    this.props.changeDate(this.props.date);
  }
  
  render() {
    var label;
    let options = { weekday: 'short', day: 'numeric' };
    switch(this.props.date.getDate()) {
      case this.props.now.getDate():
        label = "Today";
        break;
      case this.props.now.getDate() + 1:
        label = "Tomorrow";
        break;
      default:
        label = this.props.date.toLocaleString('en-GB', options);
    }
    return(
      <NavItem>
        <NavLink href="#"
        active={this.props.isActive}
        onClick={this.onClick}>{label}</NavLink>
      </NavItem>
    );
  }
}