import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalCommerceView } from '../components/LocalCommerceView';
import { axe } from './setup';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({
      transactions: [
        {
          id: 'tx_1',
          store_name: 'Indiranagar Organic Market',
          location: 'Bengaluru, Karnataka',
          is_local: 1,
          amount_spent: 1200.0,
          logistics_savings_kg: 1.35,
          credits_earned: 650,
          timestamp: '2026-06-18 10:30:00',
        },
      ],
    }),
  } as any);
});

describe('LocalCommerceView', () => {
  it('renders the title', () => {
    render(<LocalCommerceView locale="en" />);
    expect(screen.getByRole('heading', { name: /B2B2C Local Commerce/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<LocalCommerceView locale="en" />);
    expect(screen.getByText(/Support local Bengaluru commerce/i)).toBeInTheDocument();
  });

  it('renders the Log a Purchase form', () => {
    render(<LocalCommerceView locale="en" />);
    expect(screen.getByText(/Log a Purchase/i)).toBeInTheDocument();
  });

  it('renders store name, location, and amount fields', () => {
    render(<LocalCommerceView locale="en" />);
    expect(screen.getByLabelText(/Store \/ Merchant Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Store Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount Spent/i)).toBeInTheDocument();
  });

  it('renders the Log Transaction submit button', () => {
    render(<LocalCommerceView locale="en" />);
    expect(screen.getByText(/Log Transaction/i)).toBeInTheDocument();
  });

  it('renders the Refresh button', () => {
    render(<LocalCommerceView locale="en" />);
    expect(screen.getByRole('button', { name: /Refresh Transactions/i })).toBeInTheDocument();
  });

  it('renders the ledger table after data loads', async () => {
    render(<LocalCommerceView locale="en" />);
    await waitFor(() => expect(screen.getByText('Indiranagar Organic Market')).toBeInTheDocument());
  });

  it('renders the Local/Imported badge in the ledger', async () => {
    render(<LocalCommerceView locale="en" />);
    await waitFor(() => expect(screen.getByText(/Local Sourced/i)).toBeInTheDocument());
  });

  it('prefills the location field with Indiranagar default', () => {
    render(<LocalCommerceView locale="en" />);
    const locationInput = screen.getByLabelText(/Store Location/i);
    expect(locationInput).toHaveValue('Indiranagar, Bengaluru');
  });

  it('updates the store name input when typed', () => {
    render(<LocalCommerceView locale="en" />);
    const storeInput = screen.getByLabelText(/Store \/ Merchant Name/i);
    fireEvent.change(storeInput, { target: { value: 'Koramangala Fresh Market' } });
    expect(storeInput).toHaveValue('Koramangala Fresh Market');
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<LocalCommerceView locale="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
