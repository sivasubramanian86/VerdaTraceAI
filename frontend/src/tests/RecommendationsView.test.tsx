import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationsView } from '../components/RecommendationsView';
import { axe } from './setup';

const sampleRecs = [
  { id: 1, action: 'Migrate GCP workloads to europe-west4', category: 'GCP Region', impact: 85, complexity: 'Low' },
  { id: 2, action: 'Enable Semantic Caching', category: 'Caching', impact: 40, complexity: 'Medium' },
];

const defaultProps = {
  recommendationsList: sampleRecs,
  explainRecommendation: vi.fn(),
  locale: 'en',
};

describe('RecommendationsView', () => {
  it('renders the title', () => {
    render(<RecommendationsView {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Optimization Feed/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<RecommendationsView {...defaultProps} />);
    expect(screen.getByText(/Actionable recommendations prioritized/i)).toBeInTheDocument();
  });

  it('renders each recommendation action text', () => {
    render(<RecommendationsView {...defaultProps} />);
    expect(screen.getByText('Migrate GCP workloads to europe-west4')).toBeInTheDocument();
    expect(screen.getByText('Enable Semantic Caching')).toBeInTheDocument();
  });

  it('renders impact percentages for each recommendation', () => {
    render(<RecommendationsView {...defaultProps} />);
    expect(screen.getByText('-85%')).toBeInTheDocument();
    expect(screen.getByText('-40%')).toBeInTheDocument();
  });

  it('renders the MACC chart section', () => {
    render(<RecommendationsView {...defaultProps} />);
    expect(screen.getByText(/Marginal Abatement Cost Curve/i)).toBeInTheDocument();
  });

  it('renders Explain buttons for each recommendation', () => {
    render(<RecommendationsView {...defaultProps} />);
    const explainBtns = screen.getAllByText(/Explain/i);
    expect(explainBtns).toHaveLength(2);
  });

  it('renders Commit Action buttons for uncommitted recommendations', () => {
    render(<RecommendationsView {...defaultProps} />);
    const commitBtns = screen.getAllByText(/Commit Action/i);
    expect(commitBtns).toHaveLength(2);
  });

  it('calls explainRecommendation when Explain button is clicked', () => {
    const explainFn = vi.fn();
    render(<RecommendationsView {...defaultProps} explainRecommendation={explainFn} />);
    fireEvent.click(screen.getAllByText(/Explain/i)[0]);
    expect(explainFn).toHaveBeenCalledWith('Migrate GCP workloads to europe-west4');
  });

  it('shows the committed savings widget after committing a recommendation', () => {
    render(<RecommendationsView {...defaultProps} />);
    const commitBtns = screen.getAllByText(/Commit Action/i);
    fireEvent.click(commitBtns[0]);
    expect(screen.getByText(/Active Commitments/i)).toBeInTheDocument();
    // The committed tally widget shows "-85% Carbon Saved"
    expect(screen.getByText(/Carbon Saved/i)).toBeInTheDocument();
  });

  it('toggles a committed recommendation back to uncommitted when clicked again', () => {
    render(<RecommendationsView {...defaultProps} />);
    const commitBtns = screen.getAllByText(/Commit Action/i);
    fireEvent.click(commitBtns[0]);
    // Now click "Committed" to un-commit
    const committedBtn = screen.getByRole('button', { name: /Cancel commitment/i });
    fireEvent.click(committedBtn);
    // Widget should disappear since no committed items
    expect(screen.queryByText(/Active Commitments/i)).not.toBeInTheDocument();
  });

  it('renders complexity labels correctly', () => {
    render(<RecommendationsView {...defaultProps} />);
    expect(screen.getByText(/Low Complexity/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium Complexity/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<RecommendationsView {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
