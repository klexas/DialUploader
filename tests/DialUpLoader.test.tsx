import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialUpLoader } from '../src/DialUpLoader';

describe('DialUpLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DialUpLoader />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows CONNECT button when autoPlay is false and not playing', () => {
    render(<DialUpLoader autoPlay={false} active />);
    expect(screen.getByText('[ CONNECT ]')).toBeInTheDocument();
  });

  it('hides CONNECT button when autoPlay is true', async () => {
    render(<DialUpLoader autoPlay sound={false} />);
    await waitFor(() => {
      expect(screen.queryByText('[ CONNECT ]')).not.toBeInTheDocument();
    });
  });

  it('applies custom className to root element', () => {
    const { container } = render(<DialUpLoader className="my-loader" />);
    expect(container.firstChild).toHaveClass('dial-up-loader', 'my-loader');
  });

  it('applies custom inline styles', () => {
    render(<DialUpLoader style={{ borderRadius: 8 }} />);
    expect(screen.getByRole('status')).toHaveStyle({ borderRadius: '8px' });
  });

  it('shows custom message when provided', () => {
    render(<DialUpLoader message="Custom msg" />);
    expect(screen.getByText(/Custom msg/)).toBeInTheDocument();
  });

  it('hides modem ASCII art when showModem=false', () => {
    const { container } = render(<DialUpLoader showModem={false} />);
    expect(container.querySelector('pre')).not.toBeInTheDocument();
  });

  it('hides LED row when showLeds=false', () => {
    render(<DialUpLoader showLeds={false} />);
    expect(screen.queryByText('PWR')).not.toBeInTheDocument();
  });

  it('hides progress bar when showProgress=false', () => {
    const { container } = render(<DialUpLoader showProgress={false} />);
    // The progress bar renders inside an aria-hidden div; verify that div is absent
    const progressDivs = container.querySelectorAll('[aria-hidden="true"]');
    const hasProgressBar = Array.from(progressDivs).some((el) =>
      el.textContent?.includes('%'),
    );
    expect(hasProgressBar).toBe(false);
  });

  it('uses dark theme by default', () => {
    render(<DialUpLoader />);
    expect(screen.getByRole('status')).toHaveStyle({ backgroundColor: '#0d0d0d' });
  });

  it('uses light theme when theme="light"', () => {
    render(<DialUpLoader theme="light" />);
    expect(screen.getByRole('status')).toHaveStyle({ backgroundColor: '#f0f0f0' });
  });

  it('has accessible aria-label', () => {
    render(<DialUpLoader />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label');
  });

  it('accepts a custom aria-label', () => {
    render(<DialUpLoader aria-label="Loading data" />);
    expect(screen.getByLabelText('Loading data')).toBeInTheDocument();
  });

  it('renders when onConnect is provided with autoplay', () => {
    const onConnect = vi.fn();
    render(<DialUpLoader autoPlay sound onConnect={onConnect} speed={10} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('CONNECT button triggers play on click', async () => {
    render(<DialUpLoader autoPlay={false} sound />);
    fireEvent.click(screen.getByText('[ CONNECT ]'));
    await waitFor(() => {
      expect(screen.queryByText('[ CONNECT ]')).not.toBeInTheDocument();
    });
  });

  it('renders sm size variant', () => {
    render(<DialUpLoader size="sm" />);
    expect(screen.getByRole('status')).toHaveStyle({ fontSize: '10px' });
  });

  it('renders lg size variant', () => {
    render(<DialUpLoader size="lg" />);
    expect(screen.getByRole('status')).toHaveStyle({ fontSize: '14px' });
  });

  it('is not aria-busy when inactive', () => {
    render(<DialUpLoader active={false} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'false');
  });
});
