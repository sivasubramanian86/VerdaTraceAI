import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopilotView } from '../components/CopilotView';
import { axe } from './setup';

const defaultProps = {
  chatHistory: [],
  chatInput: '',
  setChatInput: vi.fn(),
  chatLoading: false,
  handleChatSubmit: vi.fn(),
  attachedMedia: null,
  setAttachedMedia: vi.fn(),
  locale: 'en',
};

describe('CopilotView', () => {
  it('renders the Green Copilot Chat heading', () => {
    render(<CopilotView {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /Green Copilot Chat/i })).toBeInTheDocument();
  });

  it('renders the chat input with aria-label', () => {
    render(<CopilotView {...defaultProps} />);
    expect(screen.getByRole('textbox', { name: /Ask Green Copilot/i })).toBeInTheDocument();
  });

  it('renders the send button with aria-label', () => {
    render(<CopilotView {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Send message to Green Copilot/i })).toBeInTheDocument();
  });

  it('renders the empty chat welcome message when chatHistory is empty', () => {
    render(<CopilotView {...defaultProps} />);
    expect(screen.getByText(/Ask me how to optimize your architecture/i)).toBeInTheDocument();
  });

  it('renders chat history messages when provided', () => {
    const history = [
      { role: 'user', text: 'Hello agent' },
      { role: 'agent', text: 'Hello user! I can help with carbon.' },
    ];
    render(<CopilotView {...defaultProps} chatHistory={history} />);
    expect(screen.getByText('Hello agent')).toBeInTheDocument();
    expect(screen.getByText(/Hello user/i)).toBeInTheDocument();
  });

  it('shows thinking indicator when chatLoading is true', () => {
    render(<CopilotView {...defaultProps} chatLoading={true} />);
    expect(screen.getByText(/Thinking/i)).toBeInTheDocument();
  });

  it('renders suggestion chips', () => {
    render(<CopilotView {...defaultProps} />);
    expect(screen.getByText(/Compare my AI footprint to eating beef/i)).toBeInTheDocument();
  });

  it('renders media attachment buttons', () => {
    render(<CopilotView {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Attach Image to Chat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Attach Audio to Chat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Attach Video to Chat/i })).toBeInTheDocument();
  });

  it('shows attached media pill when attachedMedia is set', () => {
    render(<CopilotView {...defaultProps} attachedMedia={{ type: 'image', count: 1, duration: 0 }} />);
    expect(screen.getByText(/Attached:/i)).toBeInTheDocument();
    expect(screen.getByText(/IMAGE/i)).toBeInTheDocument();
  });

  it('renders the remove attachment button when media is attached', () => {
    render(<CopilotView {...defaultProps} attachedMedia={{ type: 'audio', count: 0, duration: 8 }} />);
    expect(screen.getByRole('button', { name: /Remove attached file/i })).toBeInTheDocument();
  });

  it('updates input value via setChatInput when a chip is clicked', () => {
    const setChatInput = vi.fn();
    render(<CopilotView {...defaultProps} setChatInput={setChatInput} />);
    fireEvent.click(screen.getByText(/Compare my AI footprint to eating beef/i));
    expect(setChatInput).toHaveBeenCalledWith('Compare my AI footprint to eating beef');
  });

  it('has no axe accessibility violations (a11y gate)', async () => {
    const { container } = render(<CopilotView {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
