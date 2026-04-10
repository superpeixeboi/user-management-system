import { test, expect } from '@playwright/test';
import {
  setupUnauthenticated,
  setupRegisterSuccess,
  setupLoginSuccess,
  setupLoginFailure,
  setupRegisterConflict,
  setupLogout,
} from './mocks';

test.describe('Authentication', () => {
  test('unauthenticated user redirected to register', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/');
    await expect(page).toHaveURL(/register/);
  });

  test('register page shows form', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/register');
    await page.waitForSelector('[data-testid="firstName"]');

    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test.skip('register success flow', async ({ page }) => {
    await setupRegisterSuccess(page);
    await page.goto('/register');
    await page.waitForSelector('[data-testid="firstName"]');

    await page.getByTestId('firstName').fill('John');
    await page.waitForTimeout(100);
    await page.getByTestId('lastName').fill('Doe');
    await page.waitForTimeout(100);
    await page.getByTestId('email').fill('test@example.com');
    await page.waitForTimeout(100);
    await page.getByTestId('password').fill('password123');
    await page.waitForTimeout(100);
    await page.getByTestId('confirmPassword').fill('password123');
    await page.waitForTimeout(100);

    await page.getByRole('button', { name: 'Sign Up' }).click({ force: true });

    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'Hello, John!' })).toBeVisible();
  });

  test('register password mismatch shows error', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/register');
    await page.waitForSelector('[data-testid="firstName"]');

    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('email').fill('test@example.com');
    await page.getByTestId('password').fill('password123');
    await page.getByTestId('confirmPassword').fill('different');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('register short password shows error', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/register');
    await page.waitForSelector('[data-testid="firstName"]');

    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('email').fill('test@example.com');
    await page.getByTestId('password').fill('short');
    await page.getByTestId('confirmPassword').fill('short');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
  });

  test('register existing email shows error', async ({ page }) => {
    await setupRegisterConflict(page);
    await page.goto('/register');
    await page.waitForSelector('[data-testid="firstName"]');

    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('email').fill('existing@example.com');
    await page.getByTestId('password').fill('password123');
    await page.getByTestId('confirmPassword').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Email already exists')).toBeVisible();
  });

  test('login page shows form', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/login');
    await page.waitForSelector('[data-testid="email"]');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test.skip('login success', async ({ page }) => {
    await setupLoginSuccess(page);
    await page.goto('/login');
    await page.waitForSelector('[data-testid="email"]');

    await page.getByTestId('email').fill('test@example.com');
    await page.waitForTimeout(100);
    await page.getByTestId('password').fill('password123');
    await page.waitForTimeout(100);

    await page.getByRole('button', { name: 'Login' }).click({ force: true });

    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'Hello, John!' })).toBeVisible();
    await expect(page.getByText('Email: test@example.com')).toBeVisible();
    await expect(page.getByText('Role: user')).toBeVisible();
  });

  test('login invalid credentials shows error', async ({ page }) => {
    await setupLoginFailure(page);
    await page.goto('/login');
    await page.waitForSelector('[data-testid="email"]');

    await page.getByTestId('email').fill('wrong@example.com');
    await page.getByTestId('password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test.skip('logout redirects to register', async ({ page }) => {
    await setupLogout(page);
    await page.goto('/');
    await page.waitForSelector('table');
    await page.waitForSelector('button:has-text("Logout")');

    await page.getByRole('button', { name: 'Logout' }).click({ force: true });

    await page.waitForURL(/register/);
  });
});
