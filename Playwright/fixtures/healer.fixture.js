const { test: base, expect } = require('@playwright/test');
const { SelfHealingLocators, LocatorCache } = require('../AIAgent/SelfHealingLocator/SelfHealingLocators.spec.js');

const sharedCache = new LocatorCache();

exports.test = base.extend({
  healer: async ({ page }, use) => {
    const healerTool = {
      find: async (primaryLocator) => {
        const instance = new SelfHealingLocators(page, primaryLocator, { 
          cache: sharedCache,
          timeout: 1000 
        });
        return await instance.findElement();
      }
    };

    await use(healerTool);
  },
});

exports.expect = expect;