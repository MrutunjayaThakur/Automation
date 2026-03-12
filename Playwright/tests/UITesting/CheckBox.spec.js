const { test, expect } = require('@playwright/test');

test('Checkbox', async ({ page }) => {

  await page.goto('https://practice.expandtesting.com/checkboxes');

  const checkBox1 = page.locator('#checkbox1');
  const checkBox2 = page.locator('#checkbox2');

  // Validate visibility
  await expect(checkBox1).toBeVisible();
  await expect(checkBox2).toBeVisible();

  // Check checkbox1
  await checkBox1.check();
  await expect(checkBox1).toBeChecked();

  // Uncheck checkbox1
  await checkBox1.uncheck();
  await expect(checkBox1).not.toBeChecked();

  // Check checkbox2
  await checkBox2.check();
  await expect(checkBox2).toBeChecked();

});
