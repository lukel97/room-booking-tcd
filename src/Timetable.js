import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, ListGroup, ListGroupItem, Nav, NavItem, NavLink, Breadcrumb, BreadcrumbItem } from 'reactstrap';

function getTimeslots(date, startHour = 9, endHour = 24) {
  let params = "?date=" + encodeURIComponent(date.toISOString());
  return fetch("/facility/glass-rooms" + params, {method: 'get'})
    .then(response => response.json())
    .then(rooms => 
      rooms.map(room => {
        room.bookings = room.bookings.map(booking => new Date(booking));
        return room;
      })
    )
    .then(rooms => {
      let timeslots = new Array(24);
      for(var i = 0; i < timeslots.length; i++) {
        var time = new Date(date.getTime());
        time.setHours(i);
        time.setMinutes(0);
        time.setSeconds(0);
        timeslots[i] = { time: time, roomsFree: rooms};
      }
      rooms.forEach(room => {
        room.bookings.forEach(time => {
          let newFreeRooms = timeslots[time.getHours()].roomsFree.filter(r => r.roomNumber !== room.roomNumber);
          timeslots[time.getHours()].roomsFree = newFreeRooms;
        });
      });
      
      //Only return dates in the future
      return timeslots.filter(slot => slot.time > date && slot.time.getHours() >= startHour && slot.time.getHours() < endHour);
    });
}

export default class Timetable extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isCalendarOpen: false,
      currentDate: new Date(),
      timeslots: [],
      facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0]
    };
    
    this.openCalendar = this.openCalendar.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }
  
  componentDidMount() {
    this.changeDate(new Date());
  }
  
  openCalendar() {
    this.setState({
      isCalendarOpen: true
    });
  }
  
  changeDate(date) {
    this.setState({
      currentDate: date
    });
    
    getTimeslots(date).then(timeslots => {
      this.setState({
        timeslots: timeslots
      });
    }, error => console.log);
  }
  
  render() {
    if(this.state.facility == null)
      return <h1>This facility doesn't exist</h1>
    
    let now = new Date();
    let week = [...Array(14).keys()].map(i => {
      let date = new Date();
      date.setDate(now.getDate() + i);
      
      //Set dates after tomorrow to 12am
      if(i !== 0) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
      }
      return date;
    });

    const scrollableStyle = {
      overflowX: 'scroll',
      whiteSpace: 'nowrap',
      paddingLeft: '0',
      paddingRight: '0'
    };
    
    const Timeslot = ({timeslot}) => {
      let options = { hour: '2-digit', minute: '2-digit' };
      
      let time = timeslot.time;
      
      let label = time.toLocaleString('en-GB', options);
      
      let capacities = timeslot.roomsFree.map(r => r.capacity);
      let maxCapacity = Math.max(...capacities);
      
      //TODO: Pass the time in a better way
      let link = time.toUTCString();
    
      return (<ListGroupItem tag={Link} to={`${this.props.params.facility}/${link}`} action className="timeslot" disabled={timeslot.roomsFree.length <= 0}>
          <span className="time">{label}</span>
          <span className="roomsAvailable ml-4">{timeslot.roomsFree.length} rooms free</span>
          {
            timeslot.roomsFree.length > 0 && <span className="ml-4">{maxCapacity}💺</span>
          }
          <span className="ml-4">📈📺</span>
      </ListGroupItem>);
    };
    
    return (
      <Container>
        <Breadcrumb>
          <BreadcrumbItem tag={Link} to="/">Home</BreadcrumbItem>
          <BreadcrumbItem active>{this.state.facility.name}</BreadcrumbItem>
        </Breadcrumb>
        
        <ListGroup className='mt-4'>
          <ListGroupItem style={scrollableStyle}>
            <Nav pills>
              <NavItem>
              {
                this.state.isCalendarOpen ? (
                  <NavLink>
                    <input type="date" placeholder="23/02" value="2011-03-12"/>
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
            this.state.timeslots.map(timeslot =>
              <Timeslot timeslot={timeslot} key={timeslot.time.getHours()}/>
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