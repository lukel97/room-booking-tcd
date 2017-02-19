import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row} from 'reactstrap';
import Header from './Header.js';

class App extends Component {

  constructor() {
    super();
    this.state = {
      facilities: ['Glass Rooms', 'Berkeley', 'Hamilton', 'John Stearne']
    };
  }

  render() {

    var facilityComponents = this.state.facilities.map(f =>
      <Facility key={f} name={f}/>
    );

    return (
      <div className="App">
      <Header/>
      <Container className="facilities">
      {facilityComponents}
      </Container>
      </div>
    );
  }
}

class Facility extends React.Component {
  render() {
    return (
      <a role="button" onClick={() => alert("foo")}>
        <Row>
          <div className="facility">
            <h1>{this.props.name}</h1>
          </div>
        </Row>
      </a>
    );
  }
}

export default App;
