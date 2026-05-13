import { render, screen } from '@testing-library/react';
import App from './App';

test('renders brand name', () => {
  render(<App />);
  const brandElement = screen.getByText(/SP Cakes & Delight/i);
  expect(brandElement).toBeInTheDocument();
});
