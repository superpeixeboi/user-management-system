import { test, expect, type Page } from '@playwright/test';
import {
  setupUnauthenticated,
  setupRegisterSuccess,
  setupLoginSuccess,
  setupLoginFailure,
  setupRegisterConflict,
  setupLogout,
} from './mocks';

function getField(page: Page, index: number) {
  return page.locator('input.input-bordered').nth(index);
}

test.describe('Authentication', () => {
  test('unauthenticated user redirected to register', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/');
    await expect(page).toHaveURL(/register/);
  });

  test('register page shows form', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/register');
    await page.waitForSelector('input.input-bordered');

    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
    await expect(page.locator('input.input-bordered')).toHaveCount(5);
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test('register success flow', async ({ page }) => {
    await setupRegisterSuccess(page);
    await page.goto('/register');
    await page.waitForSelector('input.input-bordered');

    // Wait for the loading state to complete
    await page.waitForTimeout(1000);

    // Now fill the fields
    await getField(page, 0).fill('John');
    await getField(page, 1).fill('Doe');
    await getField(page, 2).fill('test@example.com');
    await getField(page, 3).fill('password123');
    await getField(page, 4).fill('password123');

    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Wait for navigation
    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'Hello, John!' })).toBeVisible();
  });

  test('register password mismatch shows error', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/register');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('John');
    await getField(page, 1).fill('Doe');
    await getField(page, 2).fill('test@example.com');
    await getField(page, 3).fill('password123');
    await getField(page, 4).fill('different');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('register short password shows error', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/register');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('John');
    await getField(page, 1).fill('Doe');
    await getField(page, 2).fill('test@example.com');
    await getField(page, 3).fill('short');
    await getField(page, 4).fill('short');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('register existing email shows error', async ({ page }) => {
    await setupRegisterConflict(page);
    await page.goto('/register');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('John');
    await getField(page, 1).fill('Doe');
    await getField(page, 2).fill('existing@example.com');
    await getField(page, 3).fill('password123');
    await getField(page, 4).fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Email already exists')).toBeVisible();
  });

  test('login page shows form', async ({ page }) => {
    await setupUnauthenticated(page);
    await page.goto('/login');
    await page.waitForSelector('input.input-bordered');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.locator('input.input-bordered')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('login success', async ({ page }) => {
    await setupLoginSuccess(page);
    await page.goto('/login');
    await page.waitForSelector('input.input-bordered');

    // Wait for loading state
    await page.waitForTimeout(1000);

    await getField(page, 0).fill('test@example.com');
    await getField(page, 1).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'Hello, John!' })).toBeVisible();
    await expect(page.getByText('Email: test@example.com')).toBeVisible();
    await expect(page.getByText('Role: user')).toBeVisible();
  });

  test('login invalid credentials shows error', async ({ page }) => {
    await setupLoginFailure(page);
    await page.goto('/login');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('wrong@example.com');
    await getField(page, 1).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('logout redirects to register', async ({ page }) => {
    await setupLogout(page);
    await page.goto('/');
    await page.waitForSelector('button:has-text("Logout")');

    await expect(page.getByRole('heading', { name: 'Hello, John!' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click({ force: true });

    await page.waitForURL(/register/);
  });
});
