import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from './App.jsx';

describe('application foundation', () => {
  it('renders the product name', () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /automated recruitment management system/i })).toBeInTheDocument();
  });
});
