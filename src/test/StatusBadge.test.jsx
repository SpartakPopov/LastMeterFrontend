import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge', () => {
    test('renders Pending for PENDING status', () => {
        // Arrange
        render(<StatusBadge status="PENDING" />);

        // Assert
        expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    test('renders In Transit for IN_TRANSIT status', () => {
        render(<StatusBadge status="IN_TRANSIT" />);
        expect(screen.getByText('In Transit')).toBeInTheDocument();
    });

    test('renders Delivered for DELIVERED status', () => {
        render(<StatusBadge status="DELIVERED" />);
        expect(screen.getByText('Delivered')).toBeInTheDocument();
    });

    test('renders Picked Up label', () => {
        render(<StatusBadge status="PICKED_UP" />);
        expect(screen.getByText('Picked Up')).toBeInTheDocument();
    });

    test('renders Failed label', () => {
        render(<StatusBadge status="FAILED" />);
        expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    test('unknown status just shows the status string', () => {
        // Arrange
        const unknownStatus = 'CUSTOM_STATUS';

        // Act
        render(<StatusBadge status={unknownStatus} />);

        // Assert
        expect(screen.getByText(unknownStatus)).toBeInTheDocument();
    });

    test('shows Unknown when no status is passed', () => {
        render(<StatusBadge />);
        expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    test('PENDING badge has correct background color', () => {
        // Arrange
        const { container } = render(<StatusBadge status="PENDING" />);

        // Act
        const badge = container.querySelector('span');

        // Assert
        expect(badge).toHaveStyle({ backgroundColor: '#fef9c3' });
    });

    test('FAILED badge has correct background color', () => {
        const { container } = render(<StatusBadge status="FAILED" />);
        const badge = container.querySelector('span');
        expect(badge).toHaveStyle({ backgroundColor: '#fee2e2' });
    });
});
