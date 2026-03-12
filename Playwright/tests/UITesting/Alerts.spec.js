const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('https://testautomationpractice.blogspot.com/');
});

test('Alert with OK button', async ({ page }) => {

  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toContain('I am an alert box!');
    await dialog.accept();
  });

  await page.locator('#alertBtn').click();
});

test('Confirmation Alert - OK', async ({ page }) => {

  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Press a button');
    await dialog.accept();
  });

  await page.locator('#confirmBtn').click();
});

test('Confirmation Alert - Cancel', async ({ page }) => {

  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Press a button');
    await dialog.dismiss();
  });

  await page.locator('#confirmBtn').click();
});

test('Prompt dialog', async ({ page }) => {

  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('prompt');
    expect(dialog.message()).toContain('Please enter your name');
    expect(dialog.defaultValue()).toBe('Harry Potter');
    await dialog.accept('John');
  });

  await page.locator('#promptBtn').click();
});