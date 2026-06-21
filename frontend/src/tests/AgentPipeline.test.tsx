import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentPipeline } from '../components/AgentPipeline';

// Freeze timers so the auto-advance interval doesn't interfere
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('AgentPipeline', () => {
  it('renders the pipeline title', () => {
    render(<AgentPipeline locale="en" />);
    expect(screen.getByText('ADK Multi-Agent Orchestration Mesh')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<AgentPipeline locale="en" />);
    expect(screen.getByText(/Live visualization of cooperative agent pipeline/i)).toBeInTheDocument();
  });

  it('renders the grid container with role="list" and correct aria-label', () => {
    render(<AgentPipeline locale="en" />);
    const list = screen.getByRole('list', { name: 'Agent execution pipeline' });
    expect(list).toBeInTheDocument();
  });

  it('renders all 6 agent steps as listitem elements', () => {
    render(<AgentPipeline locale="en" />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(6);
  });

  it('each agent step has an aria-label containing the agent name and description', () => {
    render(<AgentPipeline locale="en" />);
    const orchestratorItem = screen.getByRole('listitem', {
      name: /Orchestrator.*Routes intents/i,
    });
    expect(orchestratorItem).toBeInTheDocument();
  });

  it('renders all 6 agent names', () => {
    render(<AgentPipeline locale="en" />);
    expect(screen.getByText('Orchestrator')).toBeInTheDocument();
    expect(screen.getByText('Ingestion Agent')).toBeInTheDocument();
    expect(screen.getByText('Estimation Agent')).toBeInTheDocument();
    expect(screen.getByText('Optimizer Agent')).toBeInTheDocument();
    expect(screen.getByText('RAG Explainer')).toBeInTheDocument();
    expect(screen.getByText('Guardrail Agent')).toBeInTheDocument();
  });

  it('defaults to English locale when no locale prop is passed', () => {
    render(<AgentPipeline />);
    expect(screen.getByText('ADK Multi-Agent Orchestration Mesh')).toBeInTheDocument();
  });
});
