const { test, expect } = require('@playwright/test');

test.beforeEach(async ({page})=>{
   await page.goto('https://ui.vision/demo/iframes')
})

// Approach 1 — Using frameLocator()
test('Iframe - frameLocator approach', async ({ page }) => {

  const frame = page.frameLocator("iframe[src*='docs.google.com']");

  await frame.locator("text=Hi, I am the UI.Vision IDE").click();

});

// Approach 2 — Using frame()

test('Iframe - frame() approach', async ({ page }) => {

  const frame = page.frame({ url: /docs.google.com/ });

  await frame.locator("text=Hi, I am the UI.Vision IDE").click();

});