import React, { Component } from 'react';

export default class Timetable extends Component {
  
  render() {
    return (
      <h1>{this.props.params.facility}</h1>
    )
  }

}
