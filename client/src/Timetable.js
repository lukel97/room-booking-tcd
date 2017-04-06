import React, { Component } from 'react';
import { Link } from 'react-router';
import { Container, ListGroup, ListGroupItem, Nav, NavItem, NavLink, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import ReactSVG from 'react-svg';
import Amenities from '../../shared/Amenities.js';

export default class Timetable extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      isCalendarOpen: false,
      currentDate: new Date(),
      timeslots: [],
      facility: this.props.route.facilities.filter(f=>f.getURLName() === this.props.params.facility)[0],
      isLoading: true
    };
    
    this.openCalendar = this.openCalendar.bind(this);
    this.changeDate = this.changeDate.bind(this);
    this.getTimeslots = this.getTimeslots.bind(this);
  }
  
  componentDidMount() {
    this.changeDate(new Date());
  }
  
  openCalendar() {
    this.setState({
      isCalendarOpen: true
    });
  }
  
  getTimeslots(date, startHour = 9, endHour = 24) {
    let params = "?date=" + encodeURIComponent(date.toISOString());
    return fetch(`/facility/${this.state.facility.getURLName()}/availableTimes` + params, {method: 'get'})
      .then(response => response.json())
      .then(rooms => 
        //Convert date strings to date objects
        rooms.map(room => {
          room.availableTimes = room.availableTimes.map(time => new Date(time));
          return room;
        })
      )
      .then(rooms => {
        let timeslots = new Array(24);
        for(let i = 0; i < timeslots.length; i++) {
          let time = new Date(date.getTime());
          time.setHours(i);
          time.setMinutes(0);
          time.setSeconds(0);
          time.setMilliseconds(0);
  
          let roomsFree = rooms.filter(room => room.availableTimes.map(x => x.getTime()).includes(time.getTime()));
  
          timeslots[i] = { time: time, roomsFree: roomsFree };
        }
  
        //Only return dates in the future
        return timeslots.filter(slot => slot.time > date && slot.time.getHours() >= startHour && slot.time.getHours() < endHour);
      });
  }
  
  changeDate(date) {
    this.setState({
      currentDate: date,
      isLoading: true
    });
    
    this.getTimeslots(date).then(timeslots => {
      this.setState({
        timeslots: timeslots,
        isLoading: false
      });
    }, error => {
      console.log(error);
      this.setState({
        isLoading: false
      });
    });
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
      
      let numTVs = timeslot.roomsFree.map(r => r.amenities.filter(a => a === Amenities.TV).length > 0);
      let hasTV = numTVs.filter(x => x).length > 0;
      
      let numFlipcharts = timeslot.roomsFree.map(r => r.amenities.filter(a => a === Amenities.SMART_BOARD).length > 0);
      let hasFlipchart = numFlipcharts.filter(x => x).length > 0;
      
      let numLaptops = timeslot.roomsFree.map(r => r.amenities.filter(a => a === Amenities.LAPTOP).length > 0);
      let hasLaptop = numLaptops.filter(x => x).length > 0;
      
      let amenitiesLabel = "";
      if(hasTV) amenitiesLabel += "📺";
      if(hasFlipchart) amenitiesLabel += "📊";
      if(hasLaptop)	amenitiesLabel += "💻";
      
      //TODO: Pass the time in a better way
      let link = time.toUTCString();
    
      return (<ListGroupItem tag={Link} to={`${this.props.params.facility}/${link}`} action className="timeslot" disabled={timeslot.roomsFree.length <= 0}>
          <span className="time">{label}</span>
          <span className="roomsAvailable ml-4">{timeslot.roomsFree.length} rooms free</span>
          {
            timeslot.roomsFree.length > 0 && <span className="ml-4">{maxCapacity}💺</span>
          }
          <span className="ml-4">{amenitiesLabel}</span>
      </ListGroupItem>);
    };
    
    let centerStyle = {
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignContent: "center",
    };
    
//     let supportsDateInput = () => {
// 		var input = document.createElement("input");
// 		input.setAttribute("type", "date");
// 		return input.type == "date";
// 	}

	// let calendar = (<DatePicker 	value={this.state.currentDate.toISOString()}
// 									onChange={date => this.changeDate(new Date(date))}
// 									showClearButton={false}/>);
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
              	<NavLink>
              	</NavLink>
                // this.state.isCalendarOpen ? (
//                   <NavLink>
// 						{calendar}
//                   </NavLink>
//                 ) : (
//                   <NavLink href="#" onClick={this.openCalendar}>
//                     Calendar
//                   </NavLink>
//                 )
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
            this.state.isLoading ? 
            <div style={centerStyle}>
              <ReactSVG path={require("./img/spinner.svg")} style={{width: 32}}/>
            </div> :
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
