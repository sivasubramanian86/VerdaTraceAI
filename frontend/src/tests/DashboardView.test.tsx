import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from '../components/DashboardView';
import { axe } from './setup';


const mockEmissions = {
  green_score: 87,
  analysis_result: {
    co2e_emitted_kg: 142.5,
    kwh_consumed: 320.0,
    water_liters: 384.0,
    trees_offset: 71.25,
    ocean_seagrass_sqm: 114.0,
    uncertainty_pct: 12,
    water_stress_index: 'Low',
  },
};

describe('DashboardView', () => {
  it('renders the page header h2', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Workspace Carbon & Cooling Intelligence')).toBeInTheDocument();
  });

  it('renders the "AI workload carbon footprint" phrase (Req 9.2)', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByText(/AI workload carbon footprint/i)).toBeInTheDocument();
  });

  it('renders the "Scope 3 emissions linked to AI-enabled services" phrase (Req 9.4)', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByText(/Scope 3 emissions linked to AI-enabled services/i)).toBeInTheDocument();
  });

  it('shows the Green Score value from props', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('renders Green Score label', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByText(/Green Score/i)).toBeInTheDocument();
  });

  it('shows loading state when loadingDashboard is true', () => {
    render(<DashboardView emissionsData={null} loadingDashboard={true} locale="en" />);
    expect(screen.getByText(/Fetching live agentic carbon calculations/i)).toBeInTheDocument();
  });

  it('renders the AgentPipeline section', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByRole('list', { name: 'Agent execution pipeline' })).toBeInTheDocument();
  });

  it('renders the Uncertainty Interval section', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByText(/Uncertainty Interval/i)).toBeInTheDocument();
  });

  it('renders the Trends, Ledger, and Pareto tab buttons', () => {
    render(<DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />);
    expect(screen.getByText(/Trends Chart/i)).toBeInTheDocument();
    expect(screen.getByText(/Cryptographic Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Pareto Trade-offs/i)).toBeInTheDocument();
  });

  it('renders with fallback values when emissionsData is null', () => {
    render(<DashboardView emissionsData={null} loadingDashboard={false} locale="en" />);
    // Default green score fallback is 85
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(
      <DashboardView emissionsData={mockEmissions} loadingDashboard={false} locale="en" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
