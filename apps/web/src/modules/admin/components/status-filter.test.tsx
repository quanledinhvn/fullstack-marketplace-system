import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StatusFilter } from './status-filter';

describe('StatusFilter', () => {
  it('renders a select with All and each status option', () => {
    render(<StatusFilter value="" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Processing' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Verified' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Rejected' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Inconclusive' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Error' })).toBeInTheDocument();
  });

  it('calls onChange with selected status value', async () => {
    const onChange = vi.fn();
    render(<StatusFilter value="" onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'INCONCLUSIVE');

    expect(onChange).toHaveBeenCalledWith('INCONCLUSIVE');
  });

  it('reflects the current value prop as selected', () => {
    render(<StatusFilter value="VERIFIED" onChange={vi.fn()} />);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('VERIFIED');
  });
});
