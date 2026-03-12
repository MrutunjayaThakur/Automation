const { test, expect } = require('@playwright/test');

test.describe('Dropdown Automation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://practice.expandtesting.com/dropdown');
  });

  test('Simple Dropdown', async ({ page }) => {
    await page.selectOption('#dropdown', { label: 'Option 1' });
    await expect(page.locator('#dropdown')).toHaveValue('1');
  });

  test('Date of Birth Selection', async ({ page }) => {
    await page.selectOption('#day', '15');
    await page.selectOption('#month', { label: 'April' });
    await page.selectOption('#year', '2000');
  });

  test('Country Selection', async ({ page }) => {
    await page.selectOption('#country', { label: 'India' });
    await expect(page.locator('#country')).toHaveValue('IN'); // optional validation
  });

});
