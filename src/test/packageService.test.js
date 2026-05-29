import {
    createPackage,
    fetchAllPackages,
    fetchUnassignedPackages,
    fetchPackageByTrackingNumber,
} from '../services/packageService';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('packageService', () => {
    describe('fetchPackageByTrackingNumber', () => {
        test('returns package data on success', async () => {
            // Arrange
            const pkgData = { id: '1', trackingNumber: 'TRK-001', status: 'PENDING' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(pkgData),
            });

            // Act
            const result = await fetchPackageByTrackingNumber('TRK-001');

            // Assert
            expect(result).toEqual(pkgData);
            expect(fetch).toHaveBeenCalledWith('/packages/TRK-001');
        });

        test('throws correct error on 404', async () => {
            // Arrange
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: vi.fn().mockResolvedValue(null),
            });

            // Act & Assert
            await expect(fetchPackageByTrackingNumber('MISSING')).rejects.toThrow(
                'No package found with that tracking number.'
            );
        });

        test('throws server error on 500', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Error',
                json: vi.fn().mockResolvedValue(null),
            });

            await expect(fetchPackageByTrackingNumber('TRK-001')).rejects.toThrow('Server error: 500');
        });

        test('URL encodes tracking number with spaces', async () => {
            // Arrange
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({ id: '2' }),
            });

            // Act
            await fetchPackageByTrackingNumber('TRK 002');

            // Assert
            expect(fetch).toHaveBeenCalledWith('/packages/TRK%20002');
        });
    });

    describe('fetchAllPackages', () => {
        test('returns all packages', async () => {
            // Arrange
            const packages = [{ id: '1' }, { id: '2' }];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(packages),
            });

            // Act
            const result = await fetchAllPackages();

            // Assert
            expect(result).toEqual(packages);
            expect(fetch).toHaveBeenCalledWith('/packages/all');
        });

        test('throws on error', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 503,
                json: vi.fn(),
            });

            await expect(fetchAllPackages()).rejects.toThrow('Server error: 503');
        });
    });

    describe('fetchUnassignedPackages', () => {
        test('returns unassigned packages', async () => {
            const packages = [{ id: '3', status: 'PENDING' }];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(packages),
            });

            const result = await fetchUnassignedPackages();

            expect(result).toEqual(packages);
            expect(fetch).toHaveBeenCalledWith('/packages/unassigned');
        });

        test('throws on server error', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn(),
            });

            await expect(fetchUnassignedPackages()).rejects.toThrow('Server error: 500');
        });
    });

    describe('createPackage', () => {
        test('sends POST and returns created package', async () => {
            // Arrange
            const newPkg = { description: 'Books', receiverEmail: 'a@b.com' };
            const created = { id: 'pkg-new', ...newPkg };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(created),
            });

            // Act
            const result = await createPackage(newPkg);

            // Assert
            expect(result).toEqual(created);
            expect(fetch).toHaveBeenCalledWith('/packages/create', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPkg),
            }));
        });

        test('throws when server returns error', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Error',
                text: vi.fn().mockResolvedValue('Validation failed'),
            });

            await expect(createPackage({})).rejects.toThrow('Validation failed');
        });
    });
});
