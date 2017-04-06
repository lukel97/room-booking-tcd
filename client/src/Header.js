import React, { Component } from 'react';
import { Navbar, Nav, NavLink, Collapse, NavItem, NavbarBrand, NavbarToggler } from 'reactstrap';

export default class Header extends Component {

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      isSignedIn: false
    };
  }

	componentWillReceiveProps(props) {
		this.setState({isSignedIn: props.isSignedIn});
	}
  
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
  
  	if(!this.state.isSignedIn && window.gapi != null) {
    	window.gapi.signin2.render('signIn', {
			'onfailure': (e) => {console.log(e)}
    	});
    }
  
    let navItems = [];
    if(this.state.isSignedIn) {
      navItems.push(<NavItem key="bookings">
          <NavLink href="/bookings/">My bookings</NavLink>
        </NavItem>);
      navItems.push(<NavItem key="signOut">
          <NavLink href="/" onClick={this.props.signOut}>Log out</NavLink>
        </NavItem>);
    } else {
      navItems.push(<NavItem id="signIn" key="signIn"></NavItem>);
    }
    return (
      <Navbar color="faded" light toggleable className="mb-4">
        <NavbarToggler right onClick={this.toggle} />
        <NavbarBrand href="/">Trinity Room Booking</NavbarBrand>
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            {navItems}
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

