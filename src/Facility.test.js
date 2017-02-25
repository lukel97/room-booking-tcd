import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Facilities from './Facility';

it('shows facilities', () => {
  const div = document.createElement('div');
  render(<Facilities/>, div);
  expect(div.querySelectorAll('.card').length > 0).toBe(true);
});

it('shows the facility name', () => {
  const div = document.createElement('div');
  render(<Facilities/>, div);
  expect(div.querySelectorAll('.card-title').length > 0).toBe(true);
  expect(div.querySelectorAll('.card-title')[0].textContent.length > 0).toBe(true);
});

it('shows the number of free rooms', () => {
  const div = document.createElement('div');
  render(<Facilities/>, div);
  expect(div.querySelectorAll('.card-subtitle').length > 0).toBe(true);
  expect(div.querySelectorAll('.card-subtitle')[0].textContent.length > 0).toBe(true);
});