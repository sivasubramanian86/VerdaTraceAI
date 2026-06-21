import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { axe } from './setup';

const defaultProps = {
  activeTab: 'dashboard',
  setActiveTab: vi.fn(),
  isDark: true,
  toggleTheme: vi.fn(),
  locale: 'en',
  setLocale: vi.fn(),
};

describe('Sidebar', () => {
  it('renders the brand name VerdaTraceAI', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('VerdaTraceAI')).toBeInTheDocument();
  });

  it('renders the nav element', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the language selector with aria-label', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('combobox', { name: /Select Language/i })).toBeInTheDocument();
  });

  it('renders all AI Workload nav buttons', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /View Carbon Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open What-If Simulator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Optimization Recommendations/i })).toBeInTheDocument();
  });

  it('renders all Local Loops nav buttons', () => {
    render(<Sidebar {...defaultProps} />);
    // Default aria-label pattern: "Navigate to <label>"
    expect(screen.getByRole('button', { name: /Navigate to Digital Footprint/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Navigate to Local Commerce/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Navigate to Food Miles/i })).toBeInTheDocument();
  });

  it('renders Coach & Judge nav buttons', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Open Green Copilot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Judge Demo/i })).toBeInTheDocument();
  });

  it('marks the active tab with aria-current="page"', () => {
    render(<Sidebar {...defaultProps} activeTab="dashboard" />);
    const dashBtn = screen.getByRole('button', { name: /View Carbon Dashboard/i });
    expect(dashBtn).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive tabs with aria-current', () => {
    render(<Sidebar {...defaultProps} activeTab="dashboard" />);
    const simBtn = screen.getByRole('button', { name: /Open What-If Simulator/i });
    expect(simBtn).not.toHaveAttribute('aria-current');
  });

  it('calls setActiveTab when a nav button is clicked', () => {
    const setActiveTab = vi.fn();
    render(<Sidebar {...defaultProps} setActiveTab={setActiveTab} />);
    fireEvent.click(screen.getByRole('button', { name: /Open What-If Simulator/i }));
    expect(setActiveTab).toHaveBeenCalledWith('simulator');
  });

  it('renders the theme toggle button with correct label in dark mode', () => {
    render(<Sidebar {...defaultProps} isDark={true} />);
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();
  });

  it('renders the theme toggle button with correct label in light mode', () => {
    render(<Sidebar {...defaultProps} isDark={false} />);
    expect(screen.getByRole('button', { name: /Switch to dark mode/i })).toBeInTheDocument();
  });

  it('calls toggleTheme when theme button is clicked', () => {
    const toggleTheme = vi.fn();
    render(<Sidebar {...defaultProps} toggleTheme={toggleTheme} />);
    fireEvent.click(screen.getByRole('button', { name: /Switch to light mode/i }));
    expect(toggleTheme).toHaveBeenCalledOnce();
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<Sidebar {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
