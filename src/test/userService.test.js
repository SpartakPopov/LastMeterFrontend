import { searchUsers } from '../services/userService';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('userService', () => {
    describe('searchUsers', () => {
        test('returns empty array without fetching when query is empty', async () => {
            // Arrange
            global.fetch = vi.fn();

            // Act
            const result = await searchUsers('');

            // Assert
            expect(result).toEqual([]);
            expect(fetch).not.toHaveBeenCalled();
        });

        test('returns empty array when query is only whitespace', async () => {
            global.fetch = vi.fn();
            const result = await searchUsers('   ');
            expect(result).toEqual([]);
            expect(fetch).not.toHaveBeenCalled();
        });

        test('fetches and returns users for a valid query', async () => {
            // Arrange
            const users = [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Alex' }];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(users),
            });

            // Act
            const result = await searchUsers('al');

            // Assert
            expect(result).toEqual(users);
            expect(fetch).toHaveBeenCalledWith('/users/search?q=al');
        });

        test('URL encodes the query', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue([]),
            });

            await searchUsers('john doe');

            expect(fetch).toHaveBeenCalledWith('/users/search?q=john%20doe');
        });

        test('trims whitespace from query before fetching', async () => {
            // Arrange
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue([]),
            });

            // Act
            await searchUsers('  alice  ');

            // Assert
            expect(fetch).toHaveBeenCalledWith('/users/search?q=alice');
        });

        test('throws on server error', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: vi.fn() });
            await expect(searchUsers('alice')).rejects.toThrow('Server error: 500');
        });
    });
});
