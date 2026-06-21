import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DigitalFootprintView } from '../components/DigitalFootprintView';
import { axe } from './setup';

// Mock fetch to avoid network calls in tests
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({
      emails_count: 1250,
      cloud_storage_gb: 450.0,
      duplicate_media_count: 18,
      ai_usage_count: 350,
      digital_co2e_kg: 0.54,
      missions: [
        {
          id: 'clean_emails',
          title: 'Purge Old Newsletters',
          description: 'Delete 500+ promotional emails to save 5g of CO2e.',
          carbon_savings_g: 5.0,
          credits_reward: 50,
          status: 'available',
        },
      ],
    }),
  } as any);
});

describe('DigitalFootprintView', () => {
  it('renders the title', async () => {
    render(<DigitalFootprintView locale="en" />);
    expect(screen.getByText(/Digital Zero Waste Tracker/i)).toBeInTheDocument();
  });

  it('renders the subtitle', async () => {
    render(<DigitalFootprintView locale="en" />);
    expect(screen.getByText(/Optimize data bloat/i)).toBeInTheDocument();
  });

  it('renders the "digital carbon footprint" phrase (Req 9.3)', async () => {
    render(<DigitalFootprintView locale="en" />);
    // The phrase is in a <p> beneath the subtitle
    expect(screen.getByText('digital carbon footprint')).toBeInTheDocument();
  });

  it('renders the Refresh Metrics button', () => {
    render(<DigitalFootprintView locale="en" />);
    expect(screen.getByRole('button', { name: /Refresh Metrics/i })).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<DigitalFootprintView locale="en" />);
    expect(screen.getByText(/Loading digital waste telemetry/i)).toBeInTheDocument();
  });

  it('renders telemetry values after data loads', async () => {
    render(<DigitalFootprintView locale="en" />);
    await waitFor(() => expect(screen.getByText('1,250')).toBeInTheDocument());
    expect(screen.getByText('450 GB')).toBeInTheDocument();
    expect(screen.getByText('18 files')).toBeInTheDocument();
    expect(screen.getByText('350 requests')).toBeInTheDocument();
  });

  it('renders the total CO2 footprint value', async () => {
    render(<DigitalFootprintView locale="en" />);
    await waitFor(() => expect(screen.getByText('0.54')).toBeInTheDocument());
  });

  it('renders the Spring-Clean missions section', async () => {
    render(<DigitalFootprintView locale="en" />);
    await waitFor(() => expect(screen.getByText(/Digital Spring-Clean Quests/i)).toBeInTheDocument());
    expect(screen.getByText('Purge Old Newsletters')).toBeInTheDocument();
  });

  it('renders the Start Clean-up button for available missions', async () => {
    render(<DigitalFootprintView locale="en" />);
    const cleanupBtn = await screen.findByText(/Start Clean-up/i);
    expect(cleanupBtn).toBeInTheDocument();
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<DigitalFootprintView locale="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
