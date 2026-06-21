import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JudgeView } from '../components/JudgeView';
import { axe } from './setup';

const defaultProps = {
  scenario: 'baseline',
  setScenario: vi.fn(),
  triggerJudgeSummary: vi.fn(),
  judgeSummary: '',
  loadingJudgeSummary: false,
  locale: 'en',
};

describe('JudgeView', () => {
  it('renders the title', () => {
    render(<JudgeView {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Judge Contrast Demos/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<JudgeView {...defaultProps} />);
    expect(screen.getByText(/Evaluate preconfigured multi-cloud/i)).toBeInTheDocument();
  });

  it('renders the One-Click Pitch Export button', () => {
    render(<JudgeView {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Generate Pitch Summary via MCP/i })).toBeInTheDocument();
  });

  it('calls triggerJudgeSummary when the pitch button is clicked', () => {
    const triggerFn = vi.fn();
    render(<JudgeView {...defaultProps} triggerJudgeSummary={triggerFn} />);
    fireEvent.click(screen.getByRole('button', { name: /Generate Pitch Summary via MCP/i }));
    expect(triggerFn).toHaveBeenCalledOnce();
  });

  it('renders the Interactive Scenario Slider section', () => {
    render(<JudgeView {...defaultProps} />);
    expect(screen.getByText(/Interactive Scenario Slider/i)).toBeInTheDocument();
  });

  it('renders the Baseline and Optimized scenario buttons', () => {
    render(<JudgeView {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Set Scenario to Baseline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Set Scenario to Optimized/i })).toBeInTheDocument();
  });

  it('calls setScenario with "optimized" when Optimized button is clicked', () => {
    const setScenario = vi.fn();
    render(<JudgeView {...defaultProps} setScenario={setScenario} />);
    fireEvent.click(screen.getByRole('button', { name: /Set Scenario to Optimized/i }));
    expect(setScenario).toHaveBeenCalledWith('optimized');
  });

  it('renders baseline metrics in baseline scenario', () => {
    render(<JudgeView {...defaultProps} scenario="baseline" />);
    expect(screen.getByText(/850kg CO₂e \/ mo/i)).toBeInTheDocument();
    expect(screen.getByText(/450 g\/kWh/i)).toBeInTheDocument();
  });

  it('renders optimized metrics in optimized scenario', () => {
    render(<JudgeView {...defaultProps} scenario="optimized" />);
    expect(screen.getByText(/45kg CO₂e \/ mo/i)).toBeInTheDocument();
    expect(screen.getByText(/10 g\/kWh/i)).toBeInTheDocument();
  });

  it('renders the pitch output section', () => {
    render(<JudgeView {...defaultProps} />);
    expect(screen.getByText(/Pitch Generator Output/i)).toBeInTheDocument();
  });

  it('shows default pitch placeholder text when no summary', () => {
    render(<JudgeView {...defaultProps} judgeSummary="" />);
    expect(screen.getByText(/Click 'One-Click Pitch Export'/i)).toBeInTheDocument();
  });

  it('shows the judge summary when provided', () => {
    render(<JudgeView {...defaultProps} judgeSummary="VerdaTraceAI achieved 88% carbon reduction." />);
    expect(screen.getByText(/VerdaTraceAI achieved 88% carbon reduction/i)).toBeInTheDocument();
  });

  it('shows loading text when loadingJudgeSummary is true', () => {
    render(<JudgeView {...defaultProps} loadingJudgeSummary={true} />);
    expect(screen.getByText(/Calling MCP Prompt Registry/i)).toBeInTheDocument();
  });

  it('renders the compliance certificate section', () => {
    render(<JudgeView {...defaultProps} />);
    expect(screen.getByText(/Eco-Compliance Audit Certificate/i)).toBeInTheDocument();
  });

  it('renders carbon credits value for optimized scenario', () => {
    render(<JudgeView {...defaultProps} scenario="optimized" />);
    expect(screen.getByText(/520 credits/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<JudgeView {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
