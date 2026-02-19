import { ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/client/client';
import type { PrismaService } from '../../integrations/prisma/prisma.service';
import { DuplicateUsernameError } from './users.repository';
import { PrismaUsersRepository } from './prisma-users.repository';

describe('PrismaUsersRepository', () => {
  const createdAt = new Date('2026-02-01T10:00:00.000Z');
  const updatedAt = new Date('2026-02-01T11:00:00.000Z');

  it('finds by normalized username and maps dates to ISO strings', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'usr-01',
      username: 'warehouse.user',
      passwordHash: 'hash',
      role: 'user',
      createdAt,
      updatedAt,
    });
    const prismaService = {
      user: {
        findUnique,
      },
    } as unknown as PrismaService;
    const repository = new PrismaUsersRepository(prismaService);

    const found = await repository.findByUsername('  Warehouse.User  ');

    expect(findUnique).toHaveBeenCalledWith({
      where: { username: 'warehouse.user' },
    });
    expect(found).toEqual({
      id: 'usr-01',
      username: 'warehouse.user',
      passwordHash: 'hash',
      role: 'user',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });

  it('creates user with normalized username', async () => {
    const create = jest.fn().mockResolvedValue({
      id: 'usr-02',
      username: 'warehouse.user',
      passwordHash: 'hash',
      role: 'user',
      createdAt,
      updatedAt,
    });
    const prismaService = {
      user: {
        create,
      },
    } as unknown as PrismaService;
    const repository = new PrismaUsersRepository(prismaService);

    const created = await repository.create({
      id: 'usr-02',
      username: 'Warehouse.User',
      passwordHash: 'hash',
      role: 'user',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        id: 'usr-02',
        username: 'warehouse.user',
        passwordHash: 'hash',
        role: 'user',
        createdAt,
        updatedAt,
      },
    });
    expect(created).toEqual({
      id: 'usr-02',
      username: 'warehouse.user',
      passwordHash: 'hash',
      role: 'user',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });

  it('maps Prisma unique constraint violations to DuplicateUsernameError', async () => {
    const duplicateError = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as Prisma.PrismaClientKnownRequestError;
    Object.assign(duplicateError, {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (`username`)',
      name: 'PrismaClientKnownRequestError',
    });

    const prismaService = {
      user: {
        create: jest.fn().mockRejectedValue(duplicateError),
      },
    } as unknown as PrismaService;
    const repository = new PrismaUsersRepository(prismaService);

    await expect(
      repository.create({
        id: 'usr-03',
        username: 'warehouse.user',
        passwordHash: 'hash',
        role: 'user',
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      }),
    ).rejects.toThrow(DuplicateUsernameError);
  });

  it('maps unexpected Prisma failures to ServiceUnavailableException', async () => {
    const prismaService = {
      user: {
        findUnique: jest.fn().mockRejectedValue(new Error('db offline')),
      },
    } as unknown as PrismaService;
    const repository = new PrismaUsersRepository(prismaService);

    await expect(repository.findByUsername('warehouse.user')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
