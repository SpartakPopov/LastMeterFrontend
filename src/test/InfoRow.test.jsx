import { render, screen } from '@testing-library/react';
import InfoRow from '../components/InfoRow';

describe('InfoRow', () => {
    test('renders label and value', () => {
        // Arrange
        const label = 'Tracking Number';
        const value = 'TRK-12345';

        // Act
        render(<InfoRow label={label} value={value} />);

        // Assert
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByText(value)).toBeInTheDocument();
    });

    test('renders nothing when value is null', () => {
        const { container } = render(<InfoRow label="Description" value={null} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders nothing when value is undefined', () => {
        const { container } = render(<InfoRow label="Description" value={undefined} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders nothing when value is empty string', () => {
        // Arrange
        const { container } = render(<InfoRow label="Description" value="" />);

        // Assert
        expect(container.firstChild).toBeNull();
    });

    test('uses monospace font when mono is true', () => {
        // Arrange
        const label = 'ID';
        const value = 'abc-123';

        // Act
        render(<InfoRow label={label} value={value} mono />);

        // Assert
        expect(screen.getByText(value)).toHaveStyle({ fontFamily: 'DM Mono, monospace' });
    });

    test('uses default font when mono is false', () => {
        render(<InfoRow label="Name" value="John Doe" mono={false} />);
        expect(screen.getByText('John Doe')).toHaveStyle({ fontFamily: 'Outfit, sans-serif' });
    });
});
