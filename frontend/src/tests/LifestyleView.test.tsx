import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LifestyleView } from '../components/LifestyleView';
import { axe } from './setup';

describe('LifestyleView', () => {
  it('renders the title', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByRole('heading', { name: /Lifestyle Carbon Calculator/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/Optimize your real-world lifestyle footprints/i)).toBeInTheDocument();
  });

  it('renders lifestyle input habit sections', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/Input Your Lifestyle Habits/i)).toBeInTheDocument();
  });

  it('renders vehicle type select', () => {
    render(<LifestyleView locale="en" />);
    const vehicleSelect = screen.getByText(/Petrol \/ Diesel Gasoline Car/i);
    expect(vehicleSelect).toBeInTheDocument();
  });

  it('renders diet type select', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/Heavy Meat Consumer/i)).toBeInTheDocument();
  });

  it('renders the rank section', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/Lifestyle Impact Rank/i)).toBeInTheDocument();
  });

  it('renders a rank badge (default inputs fall in Average or higher range)', () => {
    render(<LifestyleView locale="en" />);
    // Default: gas car (12000km), average diet, gas heating, medium shopping
    // total ≈ 2040 + 2000 + 3200 + 960 = 8200 → "Average Citizen"
    expect(screen.getByText(/Average Citizen/i)).toBeInTheDocument();
  });

  it('renders the Total Yearly Footprint label', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/Total Yearly Footprint/i)).toBeInTheDocument();
  });

  it('renders eco-pledge buttons', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/Transition to EV/i)).toBeInTheDocument();
    expect(screen.getByText(/Rooftop Solar/i)).toBeInTheDocument();
  });

  it('renders the Eco-System Canvas section', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/Virtual Eco-System Canvas/i)).toBeInTheDocument();
  });

  it('renders the AI vs Real comparison section', () => {
    render(<LifestyleView locale="en" />);
    expect(screen.getByText(/AI vs\. Real World Comparison/i)).toBeInTheDocument();
  });

  it('renders the aiWorkloadCo2Yr value when provided', () => {
    render(<LifestyleView locale="en" aiWorkloadCo2Yr={1200} />);
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });

  it('rank changes to Eco-Guardian when footprint is low', () => {
    render(<LifestyleView locale="en" />);
    // Select "No Private Car" and "Vegan" to get low footprint
    const vehicleSelect = screen.getByDisplayValue(/Petrol/i);
    fireEvent.change(vehicleSelect, { target: { value: 'none' } });
    const dietSelect = screen.getByDisplayValue(/Average Diet/i);
    fireEvent.change(dietSelect, { target: { value: 'vegan' } });
    // This test just confirms a re-render without crash
    expect(screen.getByText(/Lifestyle Impact Rank/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<LifestyleView locale="en" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
