import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Facilities, { Facility } from './Facility';

const facilities = [new Facility("Glass Rooms", require("./img/berkeley.jpg")),
                    new Facility("Berkeley", require("./img/berkeley.jpg")),
                    new Facility("Hamilton", require("./img/berkeley.jpg")),
                    new Facility("John Stearne", require("./img/berkeley.jpg"))];
                    
const route = { facilities: facilities };

it('shows facilities', () => {
  const div = document.createElement('div');
  render(<Facilities route={route}/>, div);
  expect(div.querySelectorAll('.card').length > 0).toBe(true);
});

it('shows the facility name', () => {
  const div = document.createElement('div');
  render(<Facilities route={route}/>, div);
  expect(div.querySelectorAll('.card-title').length > 0).toBe(true);
  expect(div.querySelectorAll('.card-title')[0].textContent.length > 0).toBe(true);
});

it('shows the number of free rooms', () => {
  const div = document.createElement('div');
  render(<Facilities route={route}/>, div);
  expect(div.querySelectorAll('.card-subtitle').length > 0).toBe(true);
});


//TODO run server alongside tests
// describe('facility', () => {
//   it('should fetch the number of free rooms', () => {
//     let facility = new Facility("glass-rooms", null);
//     expect(facility.getFreeRoomCount()).resolves.toBeGreaterThanOrEqual(0);
//   });
// })