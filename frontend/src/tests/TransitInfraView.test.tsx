import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransitInfraView } from '../components/TransitInfraView';
import { axe } from './setup';

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({
      trips: [
        { mode: 'Metro', distance_km: 15.0, co2e_saved_kg: 2.25, credits_earned: 75, timestamp: '2026-06-18 08:45:00' },
      ],
      feedbacks: [],
    }),
  } as any);
});

describe('TransitInfraView', () => {
  it('renders the title', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByRole('heading', { name: /Transit Gamification/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByText(/Log low-carbon trips/i)).toBeInTheDocument();
  });

  it('renders the trip log form', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByText(/Log a Green Trip/i)).toBeInTheDocument();
  });

  it('renders the transit mode selector', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByLabelText(/Transit Mode/i)).toBeInTheDocument();
  });

  it('renders the distance input', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByLabelText(/Distance Travelled/i)).toBeInTheDocument();
  });

  it('renders the Log Trip button', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByText(/Log Trip/i)).toBeInTheDocument();
  });

  it('renders the Refresh button', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByRole('button', { name: /Refresh Transit Data/i })).toBeInTheDocument();
  });

  it('renders the Urban Mobility Feedback Canvas', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByText(/Urban Mobility Feedback Canvas/i)).toBeInTheDocument();
  });

  it('renders infrastructure feedback form sections', () => {
    render(<TransitInfraView locale="en" />);
    expect(screen.getByText(/Report Infrastructure Issue/i)).toBeInTheDocument();
  });

  it('renders trip history after data loads', async () => {
    render(<TransitInfraView locale="en" />);
    await waitFor(() => expect(screen.getByText('Metro')).toBeInTheDocument());
    expect(screen.getByText(/15 km/i)).toBeInTheDocument();
  });

  it('updates distance input when typed', () => {
    render(<TransitInfraView locale="en" />);
    const distInput = screen.getByLabelText(/Distance Travelled/i);
    fireEvent.change(distInput, { target: { value: '7.5' } });
    expect(distInput).toHaveValue(7.5);
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<TransitInfraView locale="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
