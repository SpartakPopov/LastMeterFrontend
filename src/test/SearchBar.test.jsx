import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
    test('renders input and track button', () => {
        // Arrange
        const onSearch = vi.fn();

        // Act
        render(<SearchBar onSearch={onSearch} loading={false} />);

        // Assert
        expect(screen.getByPlaceholderText('Enter tracking number')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /track/i })).toBeInTheDocument();
    });

    test('button is disabled when input is empty', () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} loading={false} />);
        expect(screen.getByRole('button', { name: /track/i })).toBeDisabled();
    });

    test('button becomes enabled when user types something', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} loading={false} />);

        // Act
        await user.type(screen.getByPlaceholderText('Enter tracking number'), 'TRK-999');

        // Assert
        expect(screen.getByRole('button', { name: /track/i })).toBeEnabled();
    });

    test('calls onSearch with trimmed value on submit', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} loading={false} />);

        // Act
        await user.type(screen.getByPlaceholderText('Enter tracking number'), '  TRK-123  ');
        await user.click(screen.getByRole('button', { name: /track/i }));

        // Assert
        expect(onSearch).toHaveBeenCalledOnce();
        expect(onSearch).toHaveBeenCalledWith('TRK-123');
    });

    test('does not call onSearch when input is only spaces', async () => {
        const user = userEvent.setup();
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} loading={false} />);

        await user.type(screen.getByPlaceholderText('Enter tracking number'), '   ');
        fireEvent.submit(screen.getByRole('button', { name: /track/i }).closest('form'));

        expect(onSearch).not.toHaveBeenCalled();
    });

    test('input and button disabled when loading', () => {
        // Arrange
        const onSearch = vi.fn();

        // Act
        render(<SearchBar onSearch={onSearch} loading={true} />);

        // Assert
        expect(screen.getByPlaceholderText('Enter tracking number')).toBeDisabled();
        expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
    });

    test('can search multiple times', async () => {
        // Arrange
        const user = userEvent.setup();
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} loading={false} />);
        const input = screen.getByPlaceholderText('Enter tracking number');

        // Act
        await user.type(input, 'FIRST-001');
        await user.click(screen.getByRole('button', { name: /track/i }));
        await user.clear(input);
        await user.type(input, 'SECOND-002');
        await user.click(screen.getByRole('button', { name: /track/i }));

        // Assert
        expect(onSearch).toHaveBeenCalledTimes(2);
        expect(onSearch).toHaveBeenNthCalledWith(1, 'FIRST-001');
        expect(onSearch).toHaveBeenNthCalledWith(2, 'SECOND-002');
    });
});
