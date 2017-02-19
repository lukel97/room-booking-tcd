import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Facilities from './Facility';

it('shows facilities', () => {
  const div = document.createElement('div');
  render(<Facilities/>, div);
  expect(div.querySelectorAll('.card').length > 0).toBe(true);
});