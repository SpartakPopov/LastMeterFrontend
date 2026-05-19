import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import App from '../../App';

// fake package to use in tests
const fakePackage = {
    id: 'pkg-001',
    trackingNumber: 'TRK-001',
    status: 'IN_TRANSIT',
    description: 'Laptop charger',
    length: 20, width: 15, height: 5,
    receiverFirstName: 'Jane',
    receiverLastName: 'Doe',
    receiverEmail: 'jane@example.com',
    buildingName: 'Main Campus',
    buildingAddress: '1 University Ave',
    lockerNumber: 'B3',
    deliveredAt: null,
    pickedUpAt: null,
};

const server = setupServer(
    http.get('/packages/:trackingNumber', ({ params }) => {
        if (params.trackingNumber === 'MISSING-999') {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json({ ...fakePackage, trackingNumber: params.trackingNumber });
    })
);

beforeAll(() => {
    // need innerWidth to be desktop size otherwise navbar buttons conflict
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    server.listen();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('tracking flow', () => {
    test('shows package info after searching a valid tracking number', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<App />);

        // Act
        await user.type(screen.getByPlaceholderText('Enter tracking number'), 'TRK-001');
        await user.click(screen.getByRole('button', { name: /^track$/i }));

        // Assert
        await waitFor(() => expect(screen.getByText('TRK-001')).toBeInTheDocument());
        expect(screen.getByText('In Transit')).toBeInTheDocument();
        expect(screen.getByText('Laptop charger')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    test('loading spinner shows while waiting for result', async () => {
        server.use(
            http.get('/packages/:trackingNumber', async () => {
                await new Promise(r => setTimeout(r, 100));
                return HttpResponse.json(fakePackage);
            })
        );

        const user = userEvent.setup();
        render(<App />);

        await user.type(screen.getByPlaceholderText('Enter tracking number'), 'TRK-001');
        await user.click(screen.getByRole('button', { name: /^track$/i }));

        // should show spinner before response comes back
        expect(screen.getByText('Fetching package info...')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Fetching package info...')).not.toBeInTheDocument());
    });

    test('shows error when package not found', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<App />);

        // Act
        await user.type(screen.getByPlaceholderText('Enter tracking number'), 'MISSING-999');
        await user.click(screen.getByRole('button', { name: /^track$/i }));

        // Assert
        await waitFor(() => expect(screen.getByText('Package not found')).toBeInTheDocument());
        expect(screen.getByText('No package found with that tracking number.')).toBeInTheDocument();
    });

    // using manual fetch mock here since overriding msw for one test was confusing
    test('shows error when server returns 500', async () => {
        vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        });

        const user = userEvent.setup();
        render(<App />);

        await user.type(screen.getByPlaceholderText('Enter tracking number'), 'TRK-001');
        await user.click(screen.getByRole('button', { name: /^track$/i }));

        await waitFor(() => expect(screen.getByText('Package not found')).toBeInTheDocument());

        vi.restoreAllMocks();
    });

    test('whitespace in tracking number gets trimmed before searching', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.type(screen.getByPlaceholderText('Enter tracking number'), '  TRK-001  ');
        await user.click(screen.getByRole('button', { name: /^track$/i }));

        await waitFor(() => expect(screen.getByText('TRK-001')).toBeInTheDocument());
    });
});
