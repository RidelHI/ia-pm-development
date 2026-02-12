import { DuplicateUsernameError } from './users.repository';
import { InMemoryUsersRepository } from './in-memory-users.repository';

describe('InMemoryUsersRepository', () => {
  it('creates and finds a user by username', async () => {
    const repository = new InMemoryUsersRepository();
    const created = await repository.create({
      id: 'usr-01',
      username: 'warehouse.user',
      passwordHash: 'hash',
      role: 'user',
      createdAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
    });

    const found = await repository.findByUsername('warehouse.user');

    expect(created.username).toBe('warehouse.user');
    expect(found).toEqual(created);
  });

  it('normalizes username and rejects duplicate registrations', async () => {
    const repository = new InMemoryUsersRepository();

    await repository.create({
      id: 'usr-01',
      username: 'Warehouse.User',
      passwordHash: 'hash',
      role: 'user',
      createdAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
    });

    await expect(
      repository.create({
        id: 'usr-02',
        username: 'warehouse.user',
        passwordHash: 'hash-2',
        role: 'user',
        createdAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-02-01T10:00:00.000Z').toISOString(),
      }),
    ).rejects.toThrow(DuplicateUsernameError);
  });
});
