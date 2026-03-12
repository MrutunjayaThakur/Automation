const { test, expect } = require('@playwright/test');

test('Handle Radio Button', async ({ page }) => {
  await page.goto('https://practice.expandtesting.com/radio-buttons');

  const radios = {
    blue: page.locator('#blue'),
    red: page.locator('#red'),
    yellow: page.locator('#yellow'),
    black: page.locator('#black'),
    green: page.locator('#green')
  };

  // Visibility & disabled check
  await expect(radios.blue).toBeVisible();
  await expect(radios.red).toBeVisible();
  await expect(radios.yellow).toBeVisible();
  await expect(radios.black).toBeVisible();
  await expect(radios.green).toBeDisabled();

  // Helper function to validate single selection
  const validateSelection = async (selected) => {
    for (const [color, radio] of Object.entries(radios)) {
      if (color === selected) {
        await expect(radio).toBeChecked();
      } else if (color !== 'green') {
        await expect(radio).not.toBeChecked();
      }
    }
  };

  await radios.blue.check();
  await validateSelection('blue');

  await radios.red.check();
  await validateSelection('red');

  await radios.yellow.check();
  await validateSelection('yellow');

  await radios.black.check();
  await validateSelection('black');
});
