import {
    getAllOrderRequests,
    createOrderRequest,
    approveOrderRequest,
    rejectOrderRequest,
    fulfillOrderRequest,
    getAllOrderGroups,
    createOrderGroup,
    deleteOrderGroup,
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

    describe('getAllOrderGroups', () => {
        test('returns list of order groups', async () => {
            // Arrange
            const groups = [{ id: 'grp-1', name: 'Batch A', orderRequestIds: ['req-1', 'req-2'] }];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(groups),
            });

            // Act
            const result = await getAllOrderGroups();

            // Assert
            expect(result).toEqual(groups);
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/order-groups'));
        });

        test('throws on server error', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: vi.fn() });
            await expect(getAllOrderGroups()).rejects.toThrow('Server error: 500');
        });
    });

    describe('createOrderGroup', () => {
        test('sends POST with name, requestedById and orderRequestIds', async () => {
            // Arrange
            const created = { id: 'grp-new', name: 'Batch B' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(created),
            });

            // Act
            const result = await createOrderGroup('Batch B', 'user-1', ['req-3', 'req-4']);

            // Assert
            expect(result).toEqual(created);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/order-groups'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Batch B', requestedById: 'user-1', orderRequestIds: ['req-3', 'req-4'] }),
                })
            );
        });

        test('throws error message from server body on failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                text: vi.fn().mockResolvedValue('All requests must be from the same user'),
            });

            await expect(createOrderGroup('Bad', 'u1', [])).rejects.toThrow(
                'All requests must be from the same user'
            );
        });

        test('throws generic error when body is empty on failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 422,
                text: vi.fn().mockResolvedValue(''),
            });

            await expect(createOrderGroup('Bad', 'u1', [])).rejects.toThrow('Server error: 422');
        });
    });

    describe('deleteOrderGroup', () => {
        test('sends DELETE to correct endpoint', async () => {
            // Arrange
            global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 });

            // Act
            await deleteOrderGroup('grp-99');

            // Assert
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/order-groups/grp-99'),
                { method: 'DELETE' }
            );
        });

        test('throws on server error', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, json: vi.fn() });
            await expect(deleteOrderGroup('grp-missing')).rejects.toThrow('Server error: 404');
        });
    });
});
