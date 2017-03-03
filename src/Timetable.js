import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, ListGroup, ListGroupItem, Nav, NavItem, NavLink, Breadcrumb, BreadcrumbItem } from 'reactstrap';

function isToday(now, date) {
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getYear() === now.getYear();
}

function getTimesForDate(now) {
  return fetch("/facilities/glass-rooms")
    .then(response => response.json())
    .then(rooms => 
      rooms.map(room => {
        room.times = room.times.map(time => new Date(time));
        
        //Only use dates on today
        room.times = room.times.filter(isToday.bind(null, now));
        
        return room;
      })
    )
    .then(rooms => {
      var timeslots = new Array(24);
      for(var i = 0; i < 24; i++) {
        var time = new Date(now.getTime());
        time.setHours(i);
        time.setMinutes(0);
        time.setSeconds(0);
        timeslots[i] = { time: time, rooms: 0 };
      }
      
      rooms.forEach(room => {
        console.log(room);
        room.times.forEach(time => {
          console.log("asdf" + time.getHours());
          timeslots[time.getHours()].rooms += 1;
        });
      });
      
      //Only return dates in the future
      return timeslots.filter(slot => slot.time > now);
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
    
    getTimesForDate(new Date()).then(timeslots => {
      this.setState({
        timeslots: timeslots
      });
    }, error => {
      console.log(error);
    });
    
    // console.log(this.state.timeslots);
    
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
    if(this.state.facility == null)
      return <h1>This facility doesn't exist</h1>
    
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
    
    const Timeslot = ({timeslot}) => {
      let options = { hour: '2-digit', minute: '2-digit' };
      
      let time = timeslot.time;
      
      let label = time.toLocaleString('en-GB', options);
      
      //TODO: Pass the time in a better way
      let link = time.toUTCString();
    
      return (<ListGroupItem tag={Link} to={`${this.props.params.facility}/${link}`} action className="timeslot">
          <span className="time">{label}</span>
          <!-- TODO: workout free rooms -->
          <span className="roomsAvailable ml-4">{timeslot.rooms} rooms booked</span>
          <span className="ml-4">4💺 6💺</span>
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