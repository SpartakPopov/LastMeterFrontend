import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import OrderRequestsPage from '../../pages/OrderRequestsPage';

// ── fixtures ───────────────────────────────────────────────────────────────

const pendingReq = {
    id: '10', status: 'PENDING', description: 'Mechanical keyboard', quantity: 1,
    requestedByFirstName: 'Alice', requestedByLastName: 'Smith',
    requestedForFirstName: 'Alice', requestedForLastName: 'Smith',
    productLinks: '', managerNotes: null,
};
const approvedReq = {
    id: '11', status: 'APPROVED', description: 'Standing desk', quantity: 1,
    requestedByFirstName: 'Bob', requestedByLastName: 'Jones',
    requestedForFirstName: 'Bob', requestedForLastName: 'Jones',
    productLinks: '', managerNotes: 'Approved by manager',
};
const rejectedReq = {
    id: '12', status: 'REJECTED', description: 'Gaming chair', quantity: 2,
    requestedByFirstName: 'Carol', requestedByLastName: 'Lee',
    requestedForFirstName: 'Dave', requestedForLastName: 'Brown',
    productLinks: '', managerNotes: 'Over budget',
};

// ── server ─────────────────────────────────────────────────────────────────

const server = setupServer(
    http.get('http://localhost:8080/order-requests', () => HttpResponse.json([pendingReq, approvedReq, rejectedReq])),
    http.get('http://localhost:8080/order-groups', () => HttpResponse.json([])),
    http.patch('http://localhost:8080/order-requests/:id/approve', () =>
        HttpResponse.json({ ...pendingReq, status: 'APPROVED', managerNotes: 'Looks good' })
    ),
    http.patch('http://localhost:8080/order-requests/:id/reject', () =>
        HttpResponse.json({ ...pendingReq, status: 'REJECTED', managerNotes: 'Over budget' })
    ),
    http.patch('http://localhost:8080/order-requests/:id/fulfill', () =>
        HttpResponse.json({ ...approvedReq, status: 'ORDERED' })
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

async function waitForLoad() {
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
}

// ── Status display ─────────────────────────────────────────────────────────

describe('Status display', () => {
    test('renders all three requests on load', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        expect(screen.getByText('Mechanical keyboard')).toBeInTheDocument();
        expect(screen.getByText('Standing desk')).toBeInTheDocument();
        expect(screen.getByText('Gaming chair')).toBeInTheDocument();
    });

    test('PENDING card has Approve and Reject buttons', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        const card = screen.getByText('Mechanical keyboard').closest('div[style]').parentElement.parentElement;
        expect(within(card).getByRole('button', { name: /^approve$/i })).toBeInTheDocument();
        expect(within(card).getByRole('button', { name: /^reject$/i })).toBeInTheDocument();
    });

    test('APPROVED card has Place Order button, no approve/reject', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        const card = screen.getByText('Standing desk').closest('div[style]').parentElement.parentElement;
        expect(within(card).getByRole('button', { name: /place order/i })).toBeInTheDocument();
        expect(within(card).queryByRole('button', { name: /^approve$/i })).not.toBeInTheDocument();
        expect(within(card).queryByRole('button', { name: /^reject$/i })).not.toBeInTheDocument();
    });

    test('REJECTED card has no action buttons', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        const card = screen.getByText('Gaming chair').closest('div[style]').parentElement.parentElement;
        expect(within(card).queryByRole('button', { name: /^approve$/i })).not.toBeInTheDocument();
        expect(within(card).queryByRole('button', { name: /^reject$/i })).not.toBeInTheDocument();
    });
});

// ── Status filter bar ──────────────────────────────────────────────────────

describe('Status filter bar', () => {
    test('filter buttons All / Pending / Approved / Ordered / Rejected are present', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rejected/i })).toBeInTheDocument();
    });

    test('clicking Pending hides approved and rejected requests', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^pending/i }));

        expect(screen.getByText('Mechanical keyboard')).toBeInTheDocument();
        expect(screen.queryByText('Standing desk')).not.toBeInTheDocument();
        expect(screen.queryByText('Gaming chair')).not.toBeInTheDocument();
    });

    test('clicking Approved shows only approved requests', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^approved/i }));

        expect(screen.queryByText('Mechanical keyboard')).not.toBeInTheDocument();
        expect(screen.getByText('Standing desk')).toBeInTheDocument();
        expect(screen.queryByText('Gaming chair')).not.toBeInTheDocument();
    });

    test('clicking All restores full list after filtering', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^pending/i }));
        await user.click(screen.getByRole('button', { name: /^all$/i }));

        expect(screen.getByText('Mechanical keyboard')).toBeInTheDocument();
        expect(screen.getByText('Standing desk')).toBeInTheDocument();
        expect(screen.getByText('Gaming chair')).toBeInTheDocument();
    });
});

// ── Approve flow ───────────────────────────────────────────────────────────

describe('Approve flow', () => {
    test('clicking Approve opens the Approve modal', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getAllByRole('button', { name: /^approve$/i })[0]);

        expect(screen.getByText('Approve Request')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Add a note for the user…')).toBeInTheDocument();
    });

    test('Cancel closes the modal without calling the API', async () => {
        let apiCalled = false;
        server.use(http.patch('http://localhost:8080/order-requests/:id/approve', () => { apiCalled = true; return HttpResponse.json({}); }));

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getAllByRole('button', { name: /^approve$/i })[0]);
        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(screen.queryByText('Approve Request')).not.toBeInTheDocument();
        expect(apiCalled).toBe(false);
    });

    test('submitting approve sends correct payload', async () => {
        let capturedBody;
        server.use(
            http.patch('http://localhost:8080/order-requests/:id/approve', async ({ request }) => {
                capturedBody = await request.json();
                return HttpResponse.json({ ...pendingReq, status: 'APPROVED' });
            })
        );

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getAllByRole('button', { name: /^approve$/i })[0]);
        await user.type(screen.getByPlaceholderText('Add a note for the user…'), 'Looks good');

        const modal = screen.getByText('Approve Request').closest('div');
        await user.click(within(modal).getByRole('button', { name: /^approve$/i }));

        await waitFor(() => expect(capturedBody).toBeDefined());
        expect(capturedBody.managerNotes).toBe('Looks good');
    });

    test('successful approve closes modal and shows success toast', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getAllByRole('button', { name: /^approve$/i })[0]);
        const modal = screen.getByText('Approve Request').closest('div');
        await user.click(within(modal).getByRole('button', { name: /^approve$/i }));

        await waitFor(() => expect(screen.queryByText('Approve Request')).not.toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/approved\./i)).toBeInTheDocument(), { timeout: 3000 });
    });

    test('API error is shown inside the modal', async () => {
        server.use(http.patch('http://localhost:8080/order-requests/:id/approve', () => new HttpResponse('Server error: 500', { status: 500 })));

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getAllByRole('button', { name: /^approve$/i })[0]);
        const modal = screen.getByText('Approve Request').closest('div');
        await user.click(within(modal).getByRole('button', { name: /^approve$/i }));

        await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
        expect(screen.getByText('Approve Request')).toBeInTheDocument(); // modal stays open
    });
});

// ── Reject flow ────────────────────────────────────────────────────────────

describe('Reject flow', () => {
    test('clicking Reject opens the Reject modal', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^reject$/i }));

        expect(screen.getByText('Reject Request')).toBeInTheDocument();
    });

    test('submitting reject sends correct payload', async () => {
        let capturedBody;
        server.use(
            http.patch('http://localhost:8080/order-requests/:id/reject', async ({ request }) => {
                capturedBody = await request.json();
                return HttpResponse.json({ ...pendingReq, status: 'REJECTED' });
            })
        );

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^reject$/i }));
        await user.type(screen.getByPlaceholderText('Add a note for the user…'), 'Over budget');

        const modal = screen.getByText('Reject Request').closest('div');
        await user.click(within(modal).getByRole('button', { name: /^reject$/i }));

        await waitFor(() => expect(capturedBody).toBeDefined());
        expect(capturedBody.managerNotes).toBe('Over budget');
    });
});

// ── Fulfill (Place Order) flow ─────────────────────────────────────────────

describe('Fulfill / Place Order flow', () => {
    test('clicking Place Order opens the fulfill modal', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /place order & add tracking/i }));

        expect(screen.getByText('Place Order')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Tracking number *')).toBeInTheDocument();
    });

    test('submitting with no tracking number keeps the modal open', async () => {
        let apiCalled = false;
        server.use(http.patch('http://localhost:8080/order-requests/:id/fulfill', () => { apiCalled = true; return HttpResponse.json({}); }));

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /place order & add tracking/i }));
        const modal = screen.getByText('Place Order').closest('div');
        await user.click(within(modal).getByRole('button', { name: /create packages/i }));

        // Modal stays open — no tracking number, nothing submitted
        expect(screen.getByText('Place Order')).toBeInTheDocument();
        expect(apiCalled).toBe(false);
    });

    test('submitting fulfill sends tracking numbers to the API', async () => {
        let capturedBody;
        server.use(
            http.patch('http://localhost:8080/order-requests/:id/fulfill', async ({ request }) => {
                capturedBody = await request.json();
                return HttpResponse.json({ ...approvedReq, status: 'ORDERED' });
            })
        );

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /place order & add tracking/i }));
        await user.type(screen.getByPlaceholderText('Tracking number *'), 'TRK-ABC123');

        const modal = screen.getByText('Place Order').closest('div');
        await user.click(within(modal).getByRole('button', { name: /create packages/i }));

        await waitFor(() => expect(capturedBody).toBeDefined());
        expect(capturedBody.packages[0].trackingNumber).toBe('TRK-ABC123');
    });

    test('successful fulfill closes modal and shows success toast', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /place order & add tracking/i }));
        await user.type(screen.getByPlaceholderText('Tracking number *'), 'TRK-XYZ');

        const modal = screen.getByText('Place Order').closest('div');
        await user.click(within(modal).getByRole('button', { name: /create packages/i }));

        await waitFor(() => expect(screen.queryByText('Place Order')).not.toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/order placed/i)).toBeInTheDocument(), { timeout: 3000 });
    });

    test('API error is shown inside the fulfill modal', async () => {
        server.use(http.patch('http://localhost:8080/order-requests/:id/fulfill', () => new HttpResponse('Server error: 500', { status: 500 })));

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /place order & add tracking/i }));
        await user.type(screen.getByPlaceholderText('Tracking number *'), 'TRK-FAIL');

        const modal = screen.getByText('Place Order').closest('div');
        await user.click(within(modal).getByRole('button', { name: /create packages/i }));

        await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
        expect(screen.getByText('Place Order')).toBeInTheDocument(); // modal stays open
    });
});
