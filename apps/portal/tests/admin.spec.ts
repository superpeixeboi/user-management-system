import { test, expect, type Page } from '@playwright/test';
import {
  setupAdminUsersList,
  setupCreateUserSuccess,
  setupCreateUserConflict,
  setupGetUser,
  setupUpdateUserSuccess,
  setupUpdateUserInactiveNameChange,
  setupDeleteUser,
  mockUsersList,
  mockEditUser,
} from './mocks';

function getField(page: Page, index: number) {
  return page.locator('input.input-bordered').nth(index);
}

function getEnabledField(page: Page, index: number) {
  return page.locator('input.input-bordered:not([disabled])').nth(index);
}

test.describe('Admin - User List', () => {
  test('admin page shows user list for admin user', async ({ page }) => {
    await setupAdminUsersList(page);
    await page.goto('/admin');
    await page.waitForSelector('table');

    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    await expect(page.getByRole('link', { name: '+ Create User' })).toBeVisible();

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(5);
  });

  test('admin page shows pagination', async ({ page }) => {
    await setupAdminUsersList(page);
    await page.goto('/admin');
    await page.waitForSelector('table');

    // With 5 users and limit 6, only 1 page - pagination not visible
    const pagination = page.locator('.flex.justify-center');
    await expect(pagination).not.toBeVisible();
  });

  test('admin page shows user info with status badges', async ({ page }) => {
    await setupAdminUsersList(page);
    await page.goto('/admin');
    await page.waitForSelector('table');

    await expect(page.getByText('admin@example.com')).toBeVisible();
    await expect(page.getByText('admin').first()).toBeVisible();
    await expect(page.locator('.badge-success').first()).toBeVisible();
  });

  test('admin page has edit and delete buttons', async ({ page }) => {
    await setupAdminUsersList(page);
    await page.goto('/admin');
    await page.waitForSelector('table');

    const editButtons = page.locator('a[href*="/admin/edit/"]');
    const deleteButtons = page.locator('button.text-error');

    await expect(editButtons).toHaveCount(5);
    await expect(deleteButtons).toHaveCount(5);
  });
});

test.describe('Admin - Create User', () => {
  test('create user page shows form', async ({ page }) => {
    await setupAdminUsersList(page);
    await page.goto('/admin/create');
    await page.waitForSelector('input.input-bordered');

    await expect(page.getByRole('heading', { name: 'Create User' })).toBeVisible();
    await expect(page.locator('input.input-bordered')).toHaveCount(5);
    await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back' })).toBeVisible();
  });

  test('create user password mismatch shows error', async ({ page }) => {
    await setupAdminUsersList(page);
    await page.goto('/admin/create');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('New');
    await getField(page, 1).fill('User');
    await getField(page, 2).fill('new@example.com');
    await getField(page, 3).fill('password123');
    await getField(page, 4).fill('different');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('create user short password shows error', async ({ page }) => {
    await setupAdminUsersList(page);
    await page.goto('/admin/create');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('New');
    await getField(page, 1).fill('User');
    await getField(page, 2).fill('new@example.com');
    await getField(page, 3).fill('short');
    await getField(page, 4).fill('short');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
  });

  test('create user success redirects to admin', async ({ page }) => {
    await setupCreateUserSuccess(page);
    await page.goto('/admin/create');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('New');
    await getField(page, 1).fill('User');
    await getField(page, 2).fill('new@example.com');
    await getField(page, 3).fill('password123');
    await getField(page, 4).fill('password123');
    await page.getByRole('button', { name: 'Create' }).click();

    await page.waitForURL(/\/admin/);
  });

  test('create user existing email shows error', async ({ page }) => {
    await setupCreateUserConflict(page);
    await page.goto('/admin/create');
    await page.waitForSelector('input.input-bordered');

    await getField(page, 0).fill('New');
    await getField(page, 1).fill('User');
    await getField(page, 2).fill('existing@example.com');
    await getField(page, 3).fill('password123');
    await getField(page, 4).fill('password123');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Email already exists')).toBeVisible();
  });
});

test.describe('Admin - Edit User', () => {
  test('edit user page shows form with user data', async ({ page }) => {
    await setupGetUser(page);
    await page.goto('/admin/edit/2');
    await page.waitForSelector('input.input-bordered');

    await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back' })).toBeVisible();
  });

  test('edit user success redirects to admin', async ({ page }) => {
    await setupUpdateUserSuccess(page);
    await page.goto('/admin/edit/2');
    await page.waitForSelector('input.input-bordered');

    await getEnabledField(page, 1).fill('Updated');
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForURL(/\/admin/);
  });

  test('inactive user name change is blocked', async ({ page }) => {
    await setupUpdateUserInactiveNameChange(page);
    await page.goto('/admin/edit/2');
    await page.waitForSelector('input.input-bordered');

    await getEnabledField(page, 1).fill('ChangedName');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Cannot change name while user is inactive')).toBeVisible();
  });
});

test.describe('Admin - Delete User', () => {
  test.skip('delete button shows confirmation modal', async ({ page }) => {
    await setupGetUser(page);
    await page.goto('/admin');
    await page.waitForSelector('table');

    await page.locator('button.text-error').first().click({ force: true });

    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete')).toBeVisible();
  });

  test.skip('delete modal cancel closes modal', async ({ page }) => {
    await setupGetUser(page);
    await page.goto('/admin');
    await page.waitForSelector('table');

    await page.locator('button.text-error').first().click({ force: true });
    await expect(page.locator('.modal')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.locator('.modal')).not.toBeVisible();
  });

  test.skip('delete modal confirm removes user', async ({ page }) => {
    await setupDeleteUser(page);
    await page.goto('/admin');
    await page.waitForSelector('table');

    await page.locator('button.text-error').first().click({ force: true });
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.waitForURL(/\/admin/);
  });
});
