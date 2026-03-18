const { test, expect } = require('../../fixtures/healer.fixture');

test('Login using self healing locators', async ({ page, healer }) => {
  await page.goto('https://practice.expandtesting.com/login');

  const username = await healer.find({ type: 'xpath', value: '//input[@id="wrongusername"]' });
  await username.fill('practice'); 

  const password = await healer.find({ type: 'xpath', value: '//input[@id="wrongPassword"]' });
  await password.fill('SuperSecretPassword!'); 

  const loginBtn = await healer.find({ type: 'xpath', value: '//input[@id="wrongLoginBtn"]' });
  await loginBtn.click();

  await expect(page).toHaveURL(/secure/);
});