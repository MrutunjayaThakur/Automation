const fs = require('fs/promises');

class TestCoverageCheckHandler {
  constructor(options = {}) {
    this.config = {
      reportPath: options.reportPath || './coverage/coverage-summary.json',
      minLines: options.minLines || 80,
      minFunctions: options.minFunctions || 80,
      minBranches: options.minBranches || 75,
      debug: options.debug || false
    };
  }

  async execute() {
    try {
      if (!await this.validate()) {
        return this.fail(`Report not found at ${this.config.reportPath}`);
      }

      const data = JSON.parse(await fs.readFile(this.config.reportPath, 'utf-8'));
      const metrics = data.total;

      if (!metrics) throw new Error('Invalid report structure: "total" missing.');

      // Destructure for readability
      const { lines, functions, branches } = metrics;
      const { minLines, minFunctions, minBranches } = this.config;

      // Check all gates
      const failures = [];
      if (lines.pct < minLines) failures.push(`Lines: ${lines.pct}% < ${minLines}%`);
      if (functions.pct < minFunctions) failures.push(`Functions: ${functions.pct}% < ${minFunctions}%`);
      if (branches.pct < minBranches) failures.push(`Branches: ${branches.pct}% < ${minBranches}%`);

      if (failures.length > 0) {
        return this.fail(`Quality Gate Failed:\n- ${failures.join('\n- ')}`);
      }

      console.log('✅ All coverage thresholds met.');
      
      return {
        success: true,
        markdown: this.generateMarkdown(metrics),
        data: metrics
      };

    } catch (err) {
      return this.handleError(err);
    }
  }

  /**
   * Generates a snippet for GitHub PR comments
   */
  generateMarkdown(m) {
    return `
### 📊 Test Coverage Report
| Metric | Status | Coverage | Threshold |
| :--- | :---: | :---: | :---: |
| **Lines** | ${m.lines.pct >= this.config.minLines ? '✅' : '❌'} | ${m.lines.pct}% | ${this.config.minLines}% |
| **Functions** | ${m.functions.pct >= this.config.minFunctions ? '✅' : '❌'} | ${m.functions.pct}% | ${this.config.minFunctions}% |
| **Branches** | ${m.branches.pct >= this.config.minBranches ? '✅' : '❌'} | ${m.branches.pct}% | ${this.config.minBranches}% |
    `.trim();
  }

  async validate() {
    try {
      await fs.access(this.config.reportPath);
      return true;
    } catch { return false; }
  }

  fail(reason) {
    console.error(`❌ ${reason}`);
    return { success: false, reason, exitCode: 1 };
  }

  handleError(err) {
    console.error(`💥 Error:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = TestCoverageCheckHandler;