import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CircularEconomyView } from '../components/CircularEconomyView';
import { axe } from './setup';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({
      items: [
        { id: 'item_1', name: 'Power Drill', owner: 'Ravi K.', status: 'available', embedded_co2e_saved_kg: 15.0 },
        { id: 'item_2', name: 'Bicycle', owner: 'Sneha M.', status: 'borrowed', embedded_co2e_saved_kg: 120.0 },
      ],
    }),
  } as any);
});

describe('CircularEconomyView', () => {
  it('renders the title', () => {
    render(<CircularEconomyView locale="en" />);
    expect(screen.getByRole('heading', { name: /CircularLoop/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<CircularEconomyView locale="en" />);
    expect(screen.getByText(/Loan or borrow rarely-used household equipment/i)).toBeInTheDocument();
  });

  it('renders the Share an Item form', () => {
    render(<CircularEconomyView locale="en" />);
    expect(screen.getByText(/Share an Item/i)).toBeInTheDocument();
  });

  it('renders the item selector with options', () => {
    render(<CircularEconomyView locale="en" />);
    expect(screen.getByLabelText(/Equipment Item/i)).toBeInTheDocument();
    expect(screen.getByText('Power Drill')).toBeInTheDocument();
  });

  it('renders the owner input', () => {
    render(<CircularEconomyView locale="en" />);
    expect(screen.getByLabelText(/Lender Name/i)).toBeInTheDocument();
  });

  it('renders the Register Shared Item button', () => {
    render(<CircularEconomyView locale="en" />);
    expect(screen.getByText(/Register Shared Item/i)).toBeInTheDocument();
  });

  it('renders the Refresh button', () => {
    render(<CircularEconomyView locale="en" />);
    expect(screen.getByRole('button', { name: /Refresh Item Pool/i })).toBeInTheDocument();
  });

  it('renders shared item listings after data loads', async () => {
    render(<CircularEconomyView locale="en" />);
    await waitFor(() => expect(screen.getByText('Power Drill')).toBeInTheDocument());
    // Bicycle appears in both the dropdown option and the listing card — use getAllByText
    expect(screen.getAllByText('Bicycle').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Borrow Item button for available items', async () => {
    render(<CircularEconomyView locale="en" />);
    await waitFor(() => expect(screen.getByText(/Borrow Item/i)).toBeInTheDocument());
  });

  it('renders the embedded CO2e saved values', async () => {
    render(<CircularEconomyView locale="en" />);
    // Values are split across text nodes: "15\n  kg CO₂e Saved"
    await waitFor(() =>
      expect(screen.getByText((_, el) =>
        el?.tagName === 'SPAN' && Boolean(el.textContent?.includes('15')) && Boolean(el.textContent?.includes('kg CO₂e Saved'))
      )).toBeInTheDocument()
    );
    expect(screen.getByText((_, el) =>
      el?.tagName === 'SPAN' && Boolean(el.textContent?.includes('120')) && Boolean(el.textContent?.includes('kg CO₂e Saved'))
    )).toBeInTheDocument();
  });

  it('updates owner input when typed', () => {
    render(<CircularEconomyView locale="en" />);
    const ownerInput = screen.getByLabelText(/Lender Name/i);
    fireEvent.change(ownerInput, { target: { value: 'Test User' } });
    expect(ownerInput).toHaveValue('Test User');
  });

  it('renders the status badges (Available / Borrowed)', async () => {
    render(<CircularEconomyView locale="en" />);
    await waitFor(() => expect(screen.getByText(/Available/i)).toBeInTheDocument());
    expect(screen.getAllByText(/Borrowed/i).length).toBeGreaterThan(0);
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<CircularEconomyView locale="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
