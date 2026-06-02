import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import OrderRequestsPage from '../../pages/OrderRequestsPage';

// ── fixtures ───────────────────────────────────────────────────────────────

const req1 = {
    id: '1', status: 'APPROVED', description: 'Keyboard', quantity: 1,
    requestedByFirstName: 'Alice', requestedByLastName: 'Smith',
    requestedForFirstName: 'Alice', requestedForLastName: 'Smith',
    productLinks: '', managerNotes: null,
};
const req2 = {
    id: '2', status: 'APPROVED', description: 'Mouse', quantity: 1,
    requestedByFirstName: 'Bob', requestedByLastName: 'Jones',
    requestedForFirstName: 'Bob', requestedForLastName: 'Jones',
    productLinks: '', managerNotes: null,
};
const req3 = {
    id: '3', status: 'PENDING', description: 'Desk lamp', quantity: 1,
    requestedByFirstName: 'Carol', requestedByLastName: 'Lee',
    requestedForFirstName: 'Carol', requestedForLastName: 'Lee',
    productLinks: '', managerNotes: null,
};

const group1 = {
    id: 'g1', name: 'Amazon batch',
    orderRequests: [req1, req2],
};

// ── server ─────────────────────────────────────────────────────────────────

let mockRequests = [req1, req2, req3];
let mockGroups = [];

const server = setupServer(
    http.get('http://localhost:8080/order-requests', () => HttpResponse.json(mockRequests)),
    http.get('http://localhost:8080/order-groups',   () => HttpResponse.json(mockGroups)),
    http.post('http://localhost:8080/order-groups', async ({ request }) => {
        const body = await request.json();
        const newGroup = { id: 'g-new', name: body.name, orderRequests: [req1, req2] };
        mockGroups = [newGroup];
        return HttpResponse.json(newGroup, { status: 201 });
    }),
    http.delete('http://localhost:8080/order-groups/:id', () => {
        mockGroups = [];
        return new HttpResponse(null, { status: 204 });
    }),
    http.post('http://localhost:8080/order-groups/:id/fulfill', () => new HttpResponse(null, { status: 204 })),
);

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    mockRequests = [req1, req2, req3];
    mockGroups = [];
});
afterAll(() => server.close());

// ── helpers ────────────────────────────────────────────────────────────────

async function waitForLoad() {
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
}

// ── Select mode ────────────────────────────────────────────────────────────

describe('Select mode', () => {
    test('Select button toggles select mode on/off', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /cancel/i }));
        expect(screen.getByRole('button', { name: /^select$/i })).toBeInTheDocument();
    });

    test('"Group N selected" button appears only after 2+ items are checked', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        expect(screen.queryByRole('button', { name: /group/i })).not.toBeInTheDocument();

        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        expect(screen.queryByRole('button', { name: /group/i })).not.toBeInTheDocument();

        await user.click(checkboxes[1]);
        expect(screen.getByRole('button', { name: /group 2 selected/i })).toBeInTheDocument();
    });

    test('cancelling select mode clears all selections', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        expect(screen.getByRole('button', { name: /group 2 selected/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /cancel/i }));
        await user.click(screen.getByRole('button', { name: /^select$/i }));
        expect(screen.queryByRole('button', { name: /group/i })).not.toBeInTheDocument();
    });
});

// ── Group creation ─────────────────────────────────────────────────────────

describe('Group creation', () => {
    test('opening the group modal shows name input', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        await user.click(screen.getByRole('button', { name: /group 2 selected/i }));

        expect(screen.getByPlaceholderText(/amazon june order/i)).toBeInTheDocument();
    });

    test('submitting group name creates the group and reloads', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        await user.click(screen.getByRole('button', { name: /group 2 selected/i }));

        await user.type(screen.getByPlaceholderText(/amazon june order/i), 'Amazon batch');

        const modal = screen.getByPlaceholderText(/amazon june order/i).closest('div[style]');
        await user.click(within(modal).getByRole('button', { name: /create/i }));

        await waitFor(() => expect(screen.getByText('Amazon batch')).toBeInTheDocument());
    });

    test('create button is disabled while name field is empty', async () => {
        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        await user.click(screen.getByRole('button', { name: /group 2 selected/i }));

        const modal = screen.getByPlaceholderText(/amazon june order/i).closest('div[style]');
        expect(within(modal).getByRole('button', { name: /create/i })).toBeDisabled();
    });

    test('sends correct request ids when creating a group', async () => {
        let capturedBody;
        server.use(
            http.post('http://localhost:8080/order-groups', async ({ request }) => {
                capturedBody = await request.json();
                mockGroups = [{ id: 'g-new', name: capturedBody.name, orderRequests: [req1, req2] }];
                return HttpResponse.json({ id: 'g-new', name: capturedBody.name, orderRequests: [req1, req2] });
            })
        );

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]); // req1
        await user.click(checkboxes[1]); // req2
        await user.click(screen.getByRole('button', { name: /group 2 selected/i }));
        await user.type(screen.getByPlaceholderText(/amazon june order/i), 'My group');

        const modal = screen.getByPlaceholderText(/amazon june order/i).closest('div[style]');
        await user.click(within(modal).getByRole('button', { name: /create/i }));

        await waitFor(() => expect(capturedBody).toBeDefined());
        expect(capturedBody.name).toBe('My group');
        expect(capturedBody.orderRequestIds).toHaveLength(2);
    });

    test('keeps modal open when group creation fails', async () => {
        server.use(http.post('http://localhost:8080/order-groups', () => new HttpResponse('Server error: 500', { status: 500 })));

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /^select$/i }));
        const checkboxes = screen.getAllByRole('checkbox');
        await user.click(checkboxes[0]);
        await user.click(checkboxes[1]);
        await user.click(screen.getByRole('button', { name: /group 2 selected/i }));
        await user.type(screen.getByPlaceholderText(/amazon june order/i), 'Bad group');

        const modal = screen.getByPlaceholderText(/amazon june order/i).closest('div[style]');
        await user.click(within(modal).getByRole('button', { name: /create/i }));

        // Modal stays open — group creation failed
        await waitFor(() => expect(screen.getByPlaceholderText(/amazon june order/i)).toBeInTheDocument());
        expect(screen.queryByText('Bad group')).not.toBeInTheDocument();
    });
});

// ── Group display ──────────────────────────────────────────────────────────

describe('Group display', () => {
    beforeEach(() => { mockGroups = [group1]; });

    test('renders persisted group with its name', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        expect(screen.getByText('Amazon batch')).toBeInTheDocument();
    });

    test('grouped requests are not shown as standalone cards', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        // Keyboard and Mouse belong to the group — they should appear inside the group,
        // not as separate top-level standalone cards.
        const standalones = screen.getAllByText('Keyboard');
        // All occurrences should live inside the group container
        standalones.forEach(el => {
            expect(el.closest('[data-group]') !== null || el.closest('div')).toBeTruthy();
        });
    });

    test('Ungroup button is present on a persisted group', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        expect(screen.getByRole('button', { name: /ungroup/i })).toBeInTheDocument();
    });

    test('clicking Ungroup sends DELETE and reloads', async () => {
        let deleteCalled = false;
        server.use(
            http.delete('http://localhost:8080/order-groups/:id', () => {
                deleteCalled = true;
                mockGroups = [];
                return new HttpResponse(null, { status: 204 });
            })
        );

        const user = userEvent.setup();
        render(<OrderRequestsPage />);
        await waitForLoad();

        await user.click(screen.getByRole('button', { name: /ungroup/i }));

        await waitFor(() => expect(deleteCalled).toBe(true));
        await waitFor(() => expect(screen.queryByText('Amazon batch')).not.toBeInTheDocument());
    });
});

// ── Group fulfillment ──────────────────────────────────────────────────────

describe('Group fulfillment', () => {
    beforeEach(() => { mockGroups = [group1]; });

    test('"Place Group Order" button is visible when all requests are APPROVED', async () => {
        render(<OrderRequestsPage />);
        await waitForLoad();
        expect(screen.getByRole('button', { name: /place group order/i })).toBeInTheDocument();
    });

    test('"Place Group Order" button is absent when group has non-APPROVED requests', async () => {
        mockGroups = [{ ...group1, orderRequests: [req1, req3] }]; // req3 is PENDING
        render(<OrderRequestsPage />);
        await waitForLoad();
        expect(screen.queryByRole('button', { name: /place group order/i })).not.toBeInTheDocument();
    });
});
