import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders search input', () => {
  const { getByLabelText } = render(<App />);
  const searchInput = getByLabelText(/search for/i);
  expect(searchInput).toBeInTheDocument();
});
