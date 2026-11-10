import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import type { UserWithRole } from 'better-auth/plugins';
import { UsersTable } from '../components/admin/users-table';
import { authClient } from '@/lib/auth-client';
import { toast } from '@/hooks/use-toast';

const refresh = jest.fn();
const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push }),
}));

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    admin: {
      setRole: jest.fn(),
      banUser: jest.fn(),
      unbanUser: jest.fn(),
      impersonateUser: jest.fn(),
      revokeUserSessions: jest.fn(),
      removeUser: jest.fn(),
    },
  },
}));

jest.mock('@/hooks/use-toast', () => ({ toast: jest.fn() }));

const admin = authClient.admin as unknown as Record<string, jest.Mock>;

const makeUser = (overrides: Partial<UserWithRole>): UserWithRole => ({
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  emailVerified: true,
  image: null,
  role: 'user',
  banned: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const users = [
  makeUser({ id: 'me', name: 'Me', email: 'me@example.com', role: 'admin' }),
  makeUser({ id: 'u1' }),
  makeUser({ id: 'u2', name: 'Bob', email: 'bob@example.com', banned: true, banReason: 'spam' }),
];

function openMenuFor(email: string) {
  fireEvent.keyDown(screen.getByRole('button', { name: `Actions for ${email}` }), { key: 'Enter' });
  return screen.getByRole('menu');
}

beforeEach(() => jest.clearAllMocks());

test('renders users with role and status badges', () => {
  render(<UsersTable users={users} currentUserId="me" />);

  expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 users
  expect(screen.getByText('(you)')).toBeInTheDocument();
  expect(screen.getByText('admin')).toBeInTheDocument();
  expect(screen.getByText('Banned')).toHaveAttribute('title', 'spam');
});

test('shows an empty state when there are no users', () => {
  render(<UsersTable users={[]} currentUserId="me" />);
  expect(screen.getByText(/no users found/i)).toBeInTheDocument();
});

test('promotes a user to admin and refreshes the list', async () => {
  admin.setRole.mockResolvedValue({ error: null });
  render(<UsersTable users={users} currentUserId="me" />);

  fireEvent.click(within(openMenuFor('ada@example.com')).getByRole('menuitem', { name: /make admin/i }));

  await waitFor(() => expect(admin.setRole).toHaveBeenCalledWith({ userId: 'u1', role: 'admin' }));
  await waitFor(() => expect(refresh).toHaveBeenCalled());
  expect(toast).toHaveBeenCalledWith({ title: 'User promoted to admin' });
});

test('shows an error toast when an action fails', async () => {
  admin.unbanUser.mockResolvedValue({ error: { message: 'Forbidden' } });
  render(<UsersTable users={users} currentUserId="me" />);

  fireEvent.click(within(openMenuFor('bob@example.com')).getByRole('menuitem', { name: /unban/i }));

  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive', description: 'Forbidden' }),
    ),
  );
  expect(refresh).not.toHaveBeenCalled();
});

test('disables destructive actions on your own account', () => {
  render(<UsersTable users={users} currentUserId="me" />);
  const menu = openMenuFor('me@example.com');

  for (const name of [/remove admin/i, /impersonate/i, /sign out everywhere/i, /^ban$/i, /delete/i]) {
    expect(within(menu).getByRole('menuitem', { name })).toHaveAttribute('aria-disabled', 'true');
  }
});

test('removing admin keeps the user\'s other roles', async () => {
  admin.setRole.mockResolvedValue({ error: null });
  render(
    <UsersTable
      users={[makeUser({ id: 'u3', email: 'ed@example.com', role: 'admin,editor' })]}
      currentUserId="me"
    />,
  );

  fireEvent.click(within(openMenuFor('ed@example.com')).getByRole('menuitem', { name: /remove admin/i }));

  await waitFor(() => expect(admin.setRole).toHaveBeenCalledWith({ userId: 'u3', role: 'editor' }));
});

test('treats ADMIN_USER_IDS users as admins and protects them', () => {
  render(
    <UsersTable
      users={[makeUser({ id: 'env', email: 'root@example.com', role: 'user' })]}
      currentUserId="me"
      adminUserIds={['env']}
    />,
  );

  expect(screen.getByText('admin (env)')).toBeInTheDocument();
  const menu = openMenuFor('root@example.com');
  expect(within(menu).queryByRole('menuitem', { name: /make admin/i })).not.toBeInTheDocument();
  for (const name of [/remove admin/i, /^ban$/i, /delete/i]) {
    expect(within(menu).getByRole('menuitem', { name })).toHaveAttribute('aria-disabled', 'true');
  }
});

test('treats expired bans as lifted', () => {
  render(
    <UsersTable
      users={[makeUser({ banned: true, banExpires: new Date('2020-01-01') })]}
      currentUserId="me"
    />,
  );

  expect(screen.queryByText('Banned')).not.toBeInTheDocument();
  expect(screen.getByText('Active')).toBeInTheDocument();
});

test('does not crash when a user has neither name nor email', () => {
  render(
    <UsersTable
      users={[makeUser({ id: 'ghost', name: '', email: null as unknown as string })]}
      currentUserId="me"
    />,
  );

  expect(screen.getByRole('button', { name: 'Actions for ghost' })).toBeInTheDocument();
});
