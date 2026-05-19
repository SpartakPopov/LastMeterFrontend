import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import OrderRequestsPage from '../../pages/OrderRequestsPage';

const fakeOrders = [
    {
        id: '1',
        status: 'PENDING',
        description: 'Need a new keyboard',
        quantity: 1,
        requestedByFirstName: 'Alice',
        requestedByLastName: 'Smith',
        requestedForFirstName: 'Bob',
        requestedForLastName: 'Jones',
        productLinks: '',
        managerNotes: null,
    },
    {
        id: '2',
        status: 'APPROVED',
        description: 'Standing desk mat',
        quantity: 2,
        requestedByFirstName: 'Carol',
        requestedByLastName: 'White',
        requestedForFirstName: 'Dave',
        requestedForLastName: 'Brown',
        productLinks: '',
        managerNotes: 'Go ahead',
    },
];

const server = setupServer(
    http.get('/order-requests', () => HttpResponse.json(fakeOrders)),
    http.patch('/order-requests/:id/approve', () => HttpResponse.json({ id: '1', status: 'APPROVED' })),
    http.patch('/order-requests/:id/reject', () => HttpResponse.json({ id: '1', status: 'REJECTED' })),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('OrderRequestsPage', () => {
    test('renders list of orders when page loads', async () => {
        render(<OrderRequestsPage />);

        await waitFor(() => expect(screen.getByText('Need a new keyboard')).toBeInTheDocument());
        expect(screen.getByText('Standing desk mat')).toBeInTheDocument();
    });

    test('shows loading text on mount', () => {
        // Arrange
        render(<OrderRequestsPage />);

        // Assert - check before the fetch resolves
        expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    test('empty state message when there are no orders', async () => {
        server.use(
            http.get('/order-requests', () => HttpResponse.json([]))
        );
        render(<OrderRequestsPage />);

        await waitFor(() => expect(screen.getByText('No order requests yet.')).toBeInTheDocument());
    });

    test('shows error if fetch fails', async () => {
        // Arrange
        server.use(
            http.get('/order-requests', () => new HttpResponse(null, { status: 500 }))
        );

        // Act
        render(<OrderRequestsPage />);

        // Assert
        await waitFor(() => expect(screen.getByText('Server error: 500')).toBeInTheDocument());
    });

    test('PENDING order has approve and reject buttons', async () => {
        render(<OrderRequestsPage />);
        await waitFor(() => screen.getByText('Need a new keyboard'));

        // not 100% sure this is the best way to scope it but it works
        const pendingCard = screen.getByText('Need a new keyboard').closest('div[style]').parentElement.parentElement;
        expect(within(pendingCard).getByRole('button', { name: /approve/i })).toBeInTheDocument();
        expect(within(pendingCard).getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });

    test('approved order shows place order button instead', async () => {
        render(<OrderRequestsPage />);
        await waitFor(() => screen.getByText('Standing desk mat'));

        expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
    });

    test('clicking approve opens modal', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitFor(() => screen.getByText('Need a new keyboard'));

        await user.click(screen.getAllByRole('button', { name: /approve/i })[0]);

        expect(screen.getByText('Approve Request')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Add a note for the user…')).toBeInTheDocument();
    });

    test('clicking reject opens reject modal', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitFor(() => screen.getByText('Need a new keyboard'));

        await user.click(screen.getByRole('button', { name: /reject/i }));

        expect(screen.getByText('Reject Request')).toBeInTheDocument();
    });

    test('submitting approve modal closes it and reloads the list', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitFor(() => screen.getByText('Need a new keyboard'));

        await user.click(screen.getAllByRole('button', { name: /approve/i })[0]);
        await user.type(screen.getByPlaceholderText('Add a note for the user…'), 'Looks good');

        const modal = screen.getByText('Approve Request').closest('div');
        await user.click(within(modal).getByRole('button', { name: /^approve$/i }));

        await waitFor(() => expect(screen.queryByText('Approve Request')).not.toBeInTheDocument());
        expect(screen.getByText('Need a new keyboard')).toBeInTheDocument();
    });

    test('cancel button closes modal', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitFor(() => screen.getByText('Need a new keyboard'));

        await user.click(screen.getAllByRole('button', { name: /approve/i })[0]);
        expect(screen.getByText('Approve Request')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(screen.queryByText('Approve Request')).not.toBeInTheDocument();
    });
});
