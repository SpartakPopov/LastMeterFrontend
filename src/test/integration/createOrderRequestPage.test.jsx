import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import CreateOrderRequestPage from '../../pages/CreateOrderRequestPage';

vi.mock('../../services/userService', () => ({
    searchUsers: vi.fn().mockResolvedValue([
        { id: 'u-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
        { id: 'u-2', firstName: 'Bob',   lastName: 'Jones', email: 'bob@example.com' },
    ]),
}));

const server = setupServer(
    http.post('/order-requests', () =>
        HttpResponse.json({ id: 'req-new', status: 'PENDING' })
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function selectAlice(user) {
    await user.type(screen.getByPlaceholderText('Search your name…'), 'Ali');
    await waitFor(() => screen.getByText('Alice Smith'));
    await user.click(screen.getByText('Alice Smith'));
}

describe('CreateOrderRequestPage', () => {
    test('renders page title and form', () => {
        render(<CreateOrderRequestPage />);

        expect(screen.getByText('New Order Request')).toBeInTheDocument();
        expect(screen.getByText('Submit Request')).toBeInTheDocument();
    });

    test('submit button is disabled when no requester is selected', () => {
        render(<CreateOrderRequestPage />);

        expect(screen.getByRole('button', { name: /submit request/i })).toBeDisabled();
    });

    test('submit button becomes enabled after selecting a requester', async () => {
        const user = userEvent.setup();
        render(<CreateOrderRequestPage />);

        await selectAlice(user);

        expect(screen.getByRole('button', { name: /submit request/i })).not.toBeDisabled();
    });

    test('shows validation error when submitting with no requester selected', async () => {
        render(<CreateOrderRequestPage />);

        const form = screen.getByRole('button', { name: /submit request/i }).closest('form');
        fireEvent.submit(form);

        await waitFor(() =>
            expect(screen.getByText('Please select who is making the request.')).toBeInTheDocument()
        );
    });

    test('unchecking "Order is for me" reveals recipient dropdown', async () => {
        const user = userEvent.setup();
        render(<CreateOrderRequestPage />);

        expect(screen.queryByPlaceholderText('Search recipient name…')).not.toBeInTheDocument();

        await user.click(screen.getByRole('checkbox'));

        expect(screen.getByPlaceholderText('Search recipient name…')).toBeInTheDocument();
    });

    test('shows validation error when recipient is not selected and sameUser is false', async () => {
        const user = userEvent.setup();
        render(<CreateOrderRequestPage />);

        // Uncheck "Order is for me" BEFORE selecting the requester, so requestedFor stays null
        await user.click(screen.getByRole('checkbox'));
        await selectAlice(user);
        await user.click(screen.getByRole('button', { name: /submit request/i }));

        await waitFor(() =>
            expect(screen.getByText('Please select who the order is for.')).toBeInTheDocument()
        );
    });

    test('successful submission shows success card', async () => {
        const user = userEvent.setup();
        render(<CreateOrderRequestPage />);

        await selectAlice(user);
        await user.click(screen.getByRole('button', { name: /submit request/i }));

        await waitFor(() =>
            expect(screen.getByText('Request submitted')).toBeInTheDocument()
        );
        expect(screen.getByText(/your order request has been sent/i)).toBeInTheDocument();
    });

    test('submission sends correct payload when ordering for self', async () => {
        const user = userEvent.setup();
        let capturedBody;
        server.use(
            http.post('/order-requests', async ({ request }) => {
                capturedBody = await request.json();
                return HttpResponse.json({ id: 'req-new', status: 'PENDING' });
            })
        );
        render(<CreateOrderRequestPage />);

        await selectAlice(user);
        await user.clear(screen.getByRole('spinbutton'));
        await user.type(screen.getByRole('spinbutton'), '3');
        await user.type(screen.getByPlaceholderText(/e\.g\. Blue/i), 'Red model Z');
        await user.click(screen.getByRole('button', { name: /submit request/i }));

        await waitFor(() => expect(capturedBody).toBeDefined());
        expect(capturedBody).toMatchObject({
            requestedById: 'u-1',
            requestedForId: 'u-1',
            quantity: 3,
            description: 'Red model Z',
        });
    });

    test('"Submit another" button resets form back to empty state', async () => {
        const user = userEvent.setup();
        render(<CreateOrderRequestPage />);

        await selectAlice(user);
        await user.click(screen.getByRole('button', { name: /submit request/i }));
        await waitFor(() => screen.getByText('Request submitted'));

        await user.click(screen.getByRole('button', { name: /submit another/i }));

        expect(screen.getByText('New Order Request')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit request/i })).toBeDisabled();
    });

    test('shows error message when API call fails', async () => {
        server.use(
            http.post('/order-requests', () =>
                new HttpResponse('Bad Request', { status: 400 })
            )
        );
        const user = userEvent.setup();
        render(<CreateOrderRequestPage />);

        await selectAlice(user);
        await user.click(screen.getByRole('button', { name: /submit request/i }));

        await waitFor(() => expect(screen.getByText('Bad Request')).toBeInTheDocument());
    });

    test('submit button shows loading text while submitting', async () => {
        server.use(
            http.post('/order-requests', async () => {
                await new Promise(r => setTimeout(r, 100));
                return HttpResponse.json({ id: 'req-new', status: 'PENDING' });
            })
        );
        const user = userEvent.setup();
        render(<CreateOrderRequestPage />);

        await selectAlice(user);
        await user.click(screen.getByRole('button', { name: /submit request/i }));

        expect(screen.getByText('Submitting…')).toBeInTheDocument();
        await waitFor(() => screen.getByText('Request submitted'));
    });
});
