const { test, expect } = require('@playwright/test');

test('Handling web tables', async ({ page }) => {

  await page.goto('https://practice.expandtesting.com/dynamic-pagination-table');

  // Show all rows
  await page.locator("select[name='example_length']").selectOption('All');

  const table = page.locator('#example');

  // Columns
  const columns = table.locator('thead tr th');
  const columnCount = await columns.count();

  console.log('Number of columns in table:', columnCount);
  expect(columnCount).toBe(6);

  // Rows
  const rows = table.locator('tbody tr');
  const rowCount = await rows.count();

  console.log('Number of rows in table:', rowCount);
  expect(rowCount).toBe(10);

});