const { test, expect } = require('@playwright/test');


test('Mouse operation', async ({ page }) => {

    await page.goto('https://vinothqaacademy.com/mouse-event/');

    // 1️ Double Click
    const doubleClick = page.locator('#doubleBtn');
    await doubleClick.dblclick();

    const status = page.locator('#doubleStatus');
    await expect(status).toHaveText('Double Click Detected ✅');


    // 2️ Right Click
    const rightClick = page.locator('#rightBtn');
    await rightClick.click({ button: 'right' });

    const rightStatus = page.locator('#rightStatus');
    await expect(rightStatus).toHaveText('Menu opened ✅');


    // 3️ Drag and Drop
    const dragElement = page.locator('#dragItem');
    const dropElement = page.locator('#dropZone');

    await dragElement.dragTo(dropElement);

    await expect(page.locator('#dragStatus')).toHaveText('Dropped Successfully ✅');

});


test('Hover operation', async ({ page }) => {

    await page.goto('https://practice.expandtesting.com/hovers');

    // Hover on first image
    const hoverElement = page.locator('.figure').first();
    await hoverElement.hover();

    // Verify hover text appears
    const hoverText = page.locator('.figcaption').first();
    await expect(hoverText).toBeVisible();

});