import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FoodMilesView } from '../components/FoodMilesView';
import { axe } from './setup';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({
      foods: [
        {
          product_name: 'Organic Avocados',
          origin: 'Spain',
          distance_km: 14500.0,
          transport_co2e_kg: 8.7,
          local_swap: 'Coorg Avocado',
          is_local: false,
        },
      ],
    }),
  } as any);
});

describe('FoodMilesView', () => {
  it('renders the title', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByRole('heading', { name: /FoodLoop/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByText(/Estimate the carbon footprint of transport logistics/i)).toBeInTheDocument();
  });

  it('renders the scan form', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByText(/Scan Label \/ Log Origin/i)).toBeInTheDocument();
  });

  it('renders the product selector', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByLabelText(/Groceries Item/i)).toBeInTheDocument();
  });

  it('renders the origin input', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByLabelText(/Country\/State of Origin/i)).toBeInTheDocument();
  });

  it('renders the Analyze Food Miles button', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByText(/Analyze Food Miles/i)).toBeInTheDocument();
  });

  it('renders the Refresh button', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByRole('button', { name: /Refresh Grocery List/i })).toBeInTheDocument();
  });

  it('renders the scanned food item after data loads', async () => {
    render(<FoodMilesView locale="en" />);
    await waitFor(() => expect(screen.getByText('Organic Avocados')).toBeInTheDocument());
  });

  it('renders the local swap suggestion for non-local item', async () => {
    render(<FoodMilesView locale="en" />);
    await waitFor(() => expect(screen.getByText('Coorg Avocado')).toBeInTheDocument());
  });

  it('renders the quick preset buttons', () => {
    render(<FoodMilesView locale="en" />);
    expect(screen.getByText('Avocado (Spain)')).toBeInTheDocument();
    expect(screen.getByText('Avocado (Coorg)')).toBeInTheDocument();
  });

  it('updates product selection when a preset is clicked', () => {
    render(<FoodMilesView locale="en" />);
    fireEvent.click(screen.getByText('Coffee (Ethiopia)'));
    const originInput = screen.getByLabelText(/Country\/State of Origin/i);
    expect(originInput).toHaveValue('Ethiopia');
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<FoodMilesView locale="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
