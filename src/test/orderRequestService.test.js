import {
    getAllOrderRequests,
    createOrderRequest,
    approveOrderRequest,
    rejectOrderRequest,
    fulfillOrderRequest,
} from '../services/orderRequestService';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('orderRequestService', () => {
    describe('getAllOrderRequests', () => {
        test('returns list of order requests', async () => {
            // Arrange
            const orders = [{ id: '1', status: 'PENDING' }];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(orders),
            });

            // Act
            const result = await getAllOrderRequests();

            // Assert
            expect(result).toEqual(orders);
            expect(fetch).toHaveBeenCalledWith('/order-requests');
        });

        test('throws on server error', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn(),
            });

            await expect(getAllOrderRequests()).rejects.toThrow('Server error: 500');
        });
    });

    describe('createOrderRequest', () => {
        test('sends POST with correct body', async () => {
            // Arrange
            const payload = { item: 'Laptop', quantity: 1 };
            const created = { id: 'req-1', ...payload };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(created),
            });

            // Act
            const result = await createOrderRequest(payload);

            // Assert
            expect(result).toEqual(created);
            expect(fetch).toHaveBeenCalledWith('/order-requests', expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }));
        });

        test('throws on failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Error',
                text: vi.fn().mockResolvedValue('Invalid request data'),
            });

            await expect(createOrderRequest({})).rejects.toThrow('Invalid request data');
        });
    });

    describe('approveOrderRequest', () => {
        test('sends PATCH to approve endpoint with notes', async () => {
            // Arrange
            const id = 'req-42';
            const managerNotes = 'Looks good';
            const updated = { id, status: 'APPROVED', managerNotes };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(updated),
            });

            // Act
            const result = await approveOrderRequest(id, managerNotes);

            // Assert
            expect(result).toEqual(updated);
            expect(fetch).toHaveBeenCalledWith(`/order-requests/${id}/approve`, expect.objectContaining({
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ managerNotes }),
            }));
        });

        test('throws on error', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403, json: vi.fn() });
            await expect(approveOrderRequest('req-1', 'note')).rejects.toThrow('Server error: 403');
        });
    });

    describe('rejectOrderRequest', () => {
        test('sends PATCH to reject endpoint', async () => {
            // Arrange
            const id = 'req-99';
            const managerNotes = 'Out of stock';
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({ id, status: 'REJECTED' }),
            });

            // Act
            await rejectOrderRequest(id, managerNotes);

            // Assert
            expect(fetch).toHaveBeenCalledWith(`/order-requests/${id}/reject`, expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ managerNotes }),
            }));
        });

        test('throws on error', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: vi.fn() });
            await expect(rejectOrderRequest('req-1', 'note')).rejects.toThrow('Server error: 500');
        });
    });

    describe('fulfillOrderRequest', () => {
        test('sends PATCH to fulfill endpoint with packages', async () => {
            // Arrange
            const id = 'req-55';
            const packages = ['pkg-1', 'pkg-2'];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({ id, status: 'FULFILLED' }),
            });

            // Act
            await fulfillOrderRequest(id, packages);

            // Assert
            expect(fetch).toHaveBeenCalledWith(`/order-requests/${id}/fulfill`, expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ packages }),
            }));
        });

        test('throws on error', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: vi.fn() });
            await expect(fulfillOrderRequest('req-1', [])).rejects.toThrow('Server error: 500');
        });
    });
});
