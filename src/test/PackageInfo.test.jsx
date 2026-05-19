import { render, screen } from '@testing-library/react';
import PackageInfo from '../components/PackageInfo';

const basePkg = {
    trackingNumber: 'TRK-001',
    status: 'IN_TRANSIT',
    description: 'Fragile electronics',
    length: 30,
    width: 20,
    height: 10,
    id: 'pkg-abc-123',
    receiverFirstName: 'Jane',
    receiverLastName: 'Doe',
    receiverEmail: 'jane@example.com',
    buildingName: 'Main Campus',
    buildingAddress: '1 University Ave',
    lockerNumber: 'A12',
    deliveredAt: null,
    pickedUpAt: null,
};

describe('PackageInfo', () => {
    test('shows tracking number', () => {
        render(<PackageInfo pkg={basePkg} />);
        expect(screen.getByText('TRK-001')).toBeInTheDocument();
    });

    test('shows the correct status badge', () => {
        // Arrange
        const pkg = { ...basePkg, status: 'DELIVERED' };

        // Act
        render(<PackageInfo pkg={pkg} />);

        // Assert
        expect(screen.getByText('Delivered')).toBeInTheDocument();
    });

    test('shows dimensions in the right format', () => {
        render(<PackageInfo pkg={basePkg} />);
        expect(screen.getByText('30 x 20 x 10 cm')).toBeInTheDocument();
    });

    test('hides dimensions row if a dimension is missing', () => {
        // Arrange
        const pkg = { ...basePkg, length: null };

        // Act
        render(<PackageInfo pkg={pkg} />);

        // Assert
        expect(screen.queryByText(/x.*cm/)).toBeNull();
    });

    test('shows full name of receiver', () => {
        render(<PackageInfo pkg={basePkg} />);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    test('shows just first name when last name is missing', () => {
        // Arrange
        const pkg = { ...basePkg, receiverLastName: null };

        // Act
        render(<PackageInfo pkg={pkg} />);

        // Assert
        expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    test('shows building info', () => {
        render(<PackageInfo pkg={basePkg} />);
        expect(screen.getByText('Main Campus')).toBeInTheDocument();
        expect(screen.getByText('1 University Ave')).toBeInTheDocument();
        expect(screen.getByText('A12')).toBeInTheDocument();
    });

    test('timeline rows not shown when dates are null', () => {
        render(<PackageInfo pkg={basePkg} />);
        expect(screen.queryByText('Delivered at')).toBeNull();
        expect(screen.queryByText('Picked up at')).toBeNull();
    });
});
