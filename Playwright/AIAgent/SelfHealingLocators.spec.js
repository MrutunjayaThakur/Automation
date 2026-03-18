const fs = require('fs');
const path = require('path');

class LocatorCache {
  constructor(cacheFileName = 'locator-cache.json') {
    const dataDir = path.join(__dirname, 'data');
    this.cacheFilePath = path.join(dataDir, cacheFileName);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.cache = this.loadCache();
  }

  loadCache() {
    if (fs.existsSync(this.cacheFilePath)) {
      try {
        const fileContent = fs.readFileSync(this.cacheFilePath, 'utf-8');
        if (!fileContent || fileContent.trim() === "") return new Map();
        return new Map(Object.entries(JSON.parse(fileContent)));
      } catch (e) {
        console.warn("Could not parse locator-cache.json, starting fresh.");
        return new Map();
      }
    }
    return new Map();
  }

  saveHealedLocator(originalKey, strategy) {
    this.cache.set(originalKey, strategy);
    const obj = Object.fromEntries(this.cache);
    fs.writeFileSync(this.cacheFilePath, JSON.stringify(obj, null, 2));
    console.log(`Saved healing info to: ${this.cacheFilePath}`);
  }

  tryGetHealedLocator(originalKey) {
    return this.cache.get(originalKey) || null;
  }
} 

class SelfHealingLocators {
  constructor(page, primaryLocator, options = {}) {
    this.page = page;
    this.cache = options.cache || new LocatorCache();
    
    this.primary = primaryLocator; 
    this.currentStrategy = primaryLocator;
    this.originalKey = `${primaryLocator.type}:${primaryLocator.value}`;
    
    this.timeout = options.timeout || 2000;
  }

  async findElement(retryAttempts = 1) {
    console.log(`Searching for: ${this.originalKey}`);

    // 1. Try Primary
    let element = await this._probe(this.currentStrategy);
    if (element) return element;

    // 2. Try Cache
    const cached = this.cache.tryGetHealedLocator(this.originalKey);
    if (cached) {
        console.log(`Found cached healing for ${this.originalKey}: ${cached.value}`);
        element = await this._probe(cached);
        if (element) return element;
        console.warn(`Cached locator failed. Re-healing required.`);
    }

    // 3. AI Healing
    if (retryAttempts > 0) {
      console.warn(`Healing triggered for: ${this.originalKey}`);
      const suggestions = await this.healUsingAI();
      
      for (const alt of suggestions) {
        element = await this._probe(alt);
        if (element) {
          console.log(`AI Healed: ${alt.type}=${alt.value}`);
          this.cache.saveHealedLocator(this.originalKey, alt);
          return element;
        }
      }
    }

    throw new Error(`Self-healing failed for: ${this.originalKey}`);
  }

  async _probe(strategy) {
    try {
      const selector = this.buildSelector(strategy.type, strategy.value);
      const locator = this.page.locator(selector);
      // Wait for visible to ensure it's interactable
      await locator.first().waitFor({ state: 'visible', timeout: this.timeout });
      return locator.first();
    } catch {
      return null;
    }
  }

  async healUsingAI() {
    try {
        const pageSource = await this.page.content();
        const aiResponse = await this.mockLLMHeal(pageSource, this.primary.type, this.primary.value);
        
        return Object.entries(aiResponse)
          .filter(([_, value]) => !!value)
          .map(([type, value]) => ({ type, value }));
    } catch (e) {
        console.error("AI Healing Error:", e);
        return [];
    }
  }

  buildSelector(type, value) {
    const lookup = {
      id: `#${value}`,
      name: `[name="${value}"]`,
      class: `.${value}`,
      css: value,
      xpath: value.startsWith('//') || value.startsWith('xpath=') ? value : `xpath=${value}`,
      text: `text="${value}"`,
      testId: `data-testid=${value}` 
    };
    return lookup[type.toLowerCase()] || value;
  }

  async mockLLMHeal(source, type, value) {
    const isUsername = value.toLowerCase().includes('user');
    const isPassword = value.toLowerCase().includes('pass');
    const isButton = value.toLowerCase().includes('btn') || value.toLowerCase().includes('login');
  
    return {
      xpath: isUsername ? '//input[@id="username"]' 
           : isPassword ? '//input[@id="password"]' 
           : isButton ? '//button[@type="submit"]' 
           : null
    };
  }
}

module.exports = { SelfHealingLocators, LocatorCache };