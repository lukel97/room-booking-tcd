import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { Container, Row } from 'reactstrap';
import Header from './Header.js';
import Facility from './Facility.js';

class App extends Component {

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

    var facilityComponents = this.state.facilities.map(f =>
      <Facility key={f.name} name={f.name} image={f.image}/>
    );

    return (
      <div className="App">
      <Header/>

      <Container>
      <Row className='mt-4'>
      {facilityComponents}
      </Row>
      </Container>
      </div>
    );
  }
}

export default App;
