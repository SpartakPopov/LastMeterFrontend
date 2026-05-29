import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../components/LoadingSpinner';

describe('LoadingSpinner', () => {
    test('shows the default message', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Fetching package info...')).toBeInTheDocument();
    });

    test('shows a custom message when passed', () => {
        // Arrange
        const customMessage = 'Loading orders...';

        // Act
        render(<LoadingSpinner message={customMessage} />);

        // Assert
        expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    test('no message shown when message is empty string', () => {
        render(<LoadingSpinner message="" />);
        expect(screen.queryByRole('paragraph')).toBeNull();
    });

    test('spinner ring uses custom size', () => {
        // Arrange
        const size = 60;

        // Act
        const { container } = render(<LoadingSpinner size={size} />);

        // Assert
        const wrapper = container.firstChild.nextSibling;
        const ring = wrapper.querySelector('div');
        expect(ring).toHaveStyle({ width: '60px', height: '60px' });
    });

    test('spinner ring defaults to size 40', () => {
        const { container } = render(<LoadingSpinner />);
        const wrapper = container.firstChild.nextSibling;
        const ring = wrapper.querySelector('div');
        expect(ring).toHaveStyle({ width: '40px', height: '40px' });
    });
});
