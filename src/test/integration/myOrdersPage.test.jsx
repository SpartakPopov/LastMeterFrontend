import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import MyOrdersPage from '../../pages/MyOrdersPage';

vi.mock('../../services/userService', () => ({
    searchUsers: vi.fn().mockResolvedValue([
        { id: 'u-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
        { id: 'u-2', firstName: 'Bob',   lastName: 'Jones', email: 'bob@example.com' },
    ]),
}));

const fakeOrders = [
    {
        id: 'req-1',
        status: 'PENDING',
        requestedById: 'u-2',
        requestedForId: 'u-1',
        requestedByFirstName: 'Bob',
        requestedByLastName: 'Jones',
        requestedForFirstName: 'Alice',
        requestedForLastName: 'Smith',
        description: 'Ergonomic chair',
        productLinks: '',
        quantity: 1,
        managerNotes: null,
        createdAt: '2024-03-10T10:00:00Z',
    },
    {
        id: 'req-2',
        status: 'APPROVED',
        requestedById: 'u-1',
        requestedForId: 'u-2',
        requestedByFirstName: 'Alice',
        requestedByLastName: 'Smith',
        requestedForFirstName: 'Bob',
        requestedForLastName: 'Jones',
        description: 'Standing desk',
        productLinks: '',
        quantity: 1,
        managerNotes: 'Approved',
        createdAt: '2024-03-12T12:00:00Z',
    },
];

const server = setupServer(
    http.get('http://localhost:8080/order-requests', () => HttpResponse.json(fakeOrders)),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function selectAlice(user) {
    await user.type(screen.getByPlaceholderText('Search a user by name…'), 'Ali');
    await waitFor(() => screen.getByText('Alice Smith'));
    await user.click(screen.getByText('Alice Smith'));
}

describe('MyOrdersPage', () => {
    test('renders page title and user selector', () => {
        render(<MyOrdersPage />);

        expect(screen.getByText('My Orders')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search a user by name…')).toBeInTheDocument();
    });

    test('tabs are hidden before selecting a user', () => {
        render(<MyOrdersPage />);

        expect(screen.queryByRole('button', { name: /addressed for me/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^ordered$/i })).not.toBeInTheDocument();
    });

    test('shows tabs after selecting a user and data loads', async () => {
        const user = userEvent.setup();
        render(<MyOrdersPage />);

        await selectAlice(user);

        await waitFor(() =>
            expect(screen.getByRole('button', { name: /addressed for me/i })).toBeInTheDocument()
        );
        expect(screen.getByRole('button', { name: /^ordered$/i })).toBeInTheDocument();
    });

    test('"Addressed For Me" tab shows orders where the selected user is the recipient', async () => {
        const user = userEvent.setup();
        render(<MyOrdersPage />);

        await selectAlice(user);
        await waitFor(() => screen.getByRole('button', { name: /addressed for me/i }));

        expect(screen.getByText('Ergonomic chair')).toBeInTheDocument();
        expect(screen.queryByText('Standing desk')).not.toBeInTheDocument();
    });

    test('"Ordered" tab shows orders placed by the selected user', async () => {
        const user = userEvent.setup();
        render(<MyOrdersPage />);

        await selectAlice(user);
        await waitFor(() => screen.getByRole('button', { name: /^ordered$/i }));

        await user.click(screen.getByRole('button', { name: /^ordered$/i }));

        expect(screen.getByText('Standing desk')).toBeInTheDocument();
        expect(screen.queryByText('Ergonomic chair')).not.toBeInTheDocument();
    });

    test('shows empty state when no orders match the active tab', async () => {
        server.use(
            http.get('http://localhost:8080/order-requests', () => HttpResponse.json([]))
        );
        const user = userEvent.setup();
        render(<MyOrdersPage />);

        await selectAlice(user);
        await waitFor(() => screen.getByRole('button', { name: /addressed for me/i }));

        expect(screen.getByText(/no orders addressed to/i)).toBeInTheDocument();
    });

    test('shows loading text while fetching', async () => {
        server.use(
            http.get('http://localhost:8080/order-requests', async () => {
                await new Promise(r => setTimeout(r, 100));
                return HttpResponse.json(fakeOrders);
            })
        );
        const user = userEvent.setup();
        render(<MyOrdersPage />);

        await selectAlice(user);

        expect(screen.getByText('Loading…')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
    });

    test('shows error message when fetch fails', async () => {
        server.use(
            http.get('http://localhost:8080/order-requests', () =>
                new HttpResponse(null, { status: 500 })
            )
        );
        const user = userEvent.setup();
        render(<MyOrdersPage />);

        await selectAlice(user);

        await waitFor(() =>
            expect(screen.getByText('Server error: 500')).toBeInTheDocument()
        );
    });

    test('order card shows status badge and order details', async () => {
        const user = userEvent.setup();
        render(<MyOrdersPage />);

        await selectAlice(user);
        await waitFor(() => screen.getByText('Ergonomic chair'));

        expect(screen.getByText('PENDING')).toBeInTheDocument();
    });
});
