import React from 'react'; // Ensures React is in scope when JSX is used
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../components/login-form';
import { signIn } from '@/lib/auth-client';
import { toast } from '@/hooks/use-toast';

// Mock the Better Auth client
jest.mock('@/lib/auth-client', () => ({
  signIn: { email: jest.fn(), social: jest.fn() },
}));

const mockedSignIn = signIn as unknown as { email: jest.Mock; social: jest.Mock };

// Mock the toast function
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Test case
test('renders login form and handles input', async () => {
  render(<LoginForm />);

  // Simulate user entering email and password
  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
  const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  // Verify that the values are correctly entered
  expect(emailInput.value).toBe('test@example.com');
  expect(passwordInput.value).toBe('password123');

  // Simulate form submission by clicking the submit button
  const buttons = screen.getAllByRole('button');
  const loginButton = buttons.find((button) => button.textContent === 'Login');

  if (!loginButton) {
    throw new Error('Login button not found');
  }

  fireEvent.click(loginButton);

  // Check if signIn function is called with the correct parameters
  await waitFor(() => {
    expect(mockedSignIn.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});

test('displays error message on failed login', async () => {
  // Mock signIn to simulate a failure
  mockedSignIn.email.mockResolvedValueOnce({ data: null, error: { message: 'Invalid credentials', code: 'INVALID_EMAIL_OR_PASSWORD' } });

  render(<LoginForm />);

  // Simulate user entering email and password
  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
  const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  // Simulate form submission by clicking the submit button
  const buttons = screen.getAllByRole('button');
  const loginButton = buttons.find((button) => button.textContent === 'Login');

  if (!loginButton) {
    throw new Error('Login button not found');
  }

  fireEvent.click(loginButton);

  // Wait for the toast to be called
  await waitFor(() => {
    expect(toast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Uh oh! Something went wrong.',
      description: 'Invalid credentials',
    });
  });
});

test('triggers Google login on button click', async () => {
  render(<LoginForm />);

  // Find the "Login with Google" button
  const googleLoginButton = screen.getByRole('button', { name: /login with google/i });

  // Simulate a click on the Google login button
  fireEvent.click(googleLoginButton);

  // Verify that the signIn function is called with "google" as the provider
  await waitFor(() => {
    expect(mockedSignIn.social).toHaveBeenCalledWith({ provider: 'google' });
  });
});
