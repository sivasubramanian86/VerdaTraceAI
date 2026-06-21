import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimulatorView } from '../components/SimulatorView';
import { axe } from './setup';

const defaultProps = {
  simProvider: 'gcp',
  setSimProvider: vi.fn(),
  simCalls: 50000,
  setSimCalls: vi.fn(),
  simRegion: 'us-central1',
  setSimRegion: vi.fn(),
  simModel: 'gemini-1.5-pro',
  setSimModel: vi.fn(),
  simCaching: false,
  setSimCaching: vi.fn(),
  simExecutionHour: 12,
  setSimExecutionHour: vi.fn(),
  simMetrics: {
    kwh: '10.0',
    co2: '4.0',
    waterLiters: '18.0',
    treesOffset: '2.0',
    oceanSeagrassSqm: '3.2',
    uncertaintyPct: 22,
    waterStressIndex: 'Medium',
    greenScore: 90,
  },
  locale: 'en',
};

describe('SimulatorView', () => {
  it('renders the title', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /What-If Simulator/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText(/Simulate architectural updates/i)).toBeInTheDocument();
  });

  it('renders the "Scope 3 emissions linked to AI-enabled services" phrase (Req 9.4)', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText('Scope 3 emissions linked to AI-enabled services')).toBeInTheDocument();
  });

  it('renders the provider selector', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByLabelText(/Cloud\/Infrastructure Provider/i)).toBeInTheDocument();
  });

  it('renders the region selector', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByLabelText(/Cloud Region/i)).toBeInTheDocument();
  });

  it('renders the model selector', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByLabelText(/Model Family/i)).toBeInTheDocument();
  });

  it('renders the caching toggle', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Toggle Context Caching/i })).toBeInTheDocument();
  });

  it('renders the Simulation Projections output panel', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText(/Simulation Projections/i)).toBeInTheDocument();
  });

  it('shows the AI compute power metric from simMetrics', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText('10.0')).toBeInTheDocument();
  });

  it('renders the water footprint metric', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText('18.0')).toBeInTheDocument();
  });

  it('renders the Scope 3 Ingestion section', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText(/Scope 3 Supplier Telemetry Ingestor/i)).toBeInTheDocument();
  });

  it('renders the Parse Telemetry button', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText(/Parse Telemetry/i)).toBeInTheDocument();
  });

  it('renders the LocalLoops lifestyle variables section', () => {
    render(<SimulatorView {...defaultProps} />);
    expect(screen.getByText(/LocalLoops & Lifestyle Variables/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<SimulatorView {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
