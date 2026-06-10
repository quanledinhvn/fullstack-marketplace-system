import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StatusFilter } from './status-filter';

describe('StatusFilter', () => {
	it('renders a combobox trigger and all status options when opened', async () => {
		const user = userEvent.setup();

		render(<StatusFilter value="" onChange={vi.fn()} />);

		expect(screen.getByRole('combobox')).toBeInTheDocument();

		await user.click(screen.getByRole('combobox'));

		expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();

		expect(screen.getByRole('option', { name: 'Processing' })).toBeInTheDocument();

		expect(screen.getByRole('option', { name: 'Verified' })).toBeInTheDocument();

		expect(screen.getByRole('option', { name: 'Rejected' })).toBeInTheDocument();

		expect(screen.getByRole('option', { name: 'Inconclusive' })).toBeInTheDocument();

		expect(screen.getByRole('option', { name: 'Error' })).toBeInTheDocument();
	});

	it('calls onChange with selected status value', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(<StatusFilter value="" onChange={onChange} />);

		await user.click(screen.getByRole('combobox'));

		await user.click(screen.getByRole('option', { name: 'Inconclusive' }));

		expect(onChange).toHaveBeenCalledWith('INCONCLUSIVE');
	});

	it('calls onChange with empty string when All is selected', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(<StatusFilter value="VERIFIED" onChange={onChange} />);

		await user.click(screen.getByRole('combobox'));

		await user.click(screen.getByRole('option', { name: 'All' }));

		expect(onChange).toHaveBeenCalledWith('');
	});

	it('reflects the current value prop in the trigger display', () => {
		render(<StatusFilter value="VERIFIED" onChange={vi.fn()} />);

		expect(screen.getByText('Verified')).toBeInTheDocument();
	});
});
