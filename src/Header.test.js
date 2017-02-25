import React from 'react';
import ReactDOM, { render } from 'react-dom';
import Header from './Header';

it('shows the title', () => {
  const div = document.createElement('div');
  render(<Header/>, div);
  expect(div.querySelectorAll('.navbar-brand').length > 0).toBe(true);
});