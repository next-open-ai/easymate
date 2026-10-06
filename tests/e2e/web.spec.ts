import { expect, test } from '@playwright/test';
test('first-run admin setup reaches the product workspace', async ({ page }) => {
  await page.goto('/'); await expect(page).toHaveTitle('EasyMate');
  await expect(page.getByRole('heading', { name: '初始化本地管理员' })).toBeVisible();
  await page.getByPlaceholder('orgId，例如 local-org').fill('e2e-org'); await page.getByPlaceholder('显示名称').fill('E2E Admin');
  await page.getByPlaceholder('用户名').fill('e2e-admin'); await page.getByPlaceholder('密码（至少 6 位）').fill('e2e-password');
  await page.getByRole('button', { name: '创建管理员并进入 EasyMate' }).click();
  await expect(page.getByText('E2E Admin')).toBeVisible(); await expect(page.getByRole('navigation')).toBeVisible();
});
