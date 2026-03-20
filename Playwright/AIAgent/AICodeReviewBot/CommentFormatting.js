
class CommentFormattingHandler {
    constructor(options = {}) {
      this.botName = options.botName || 'Ai-Review-Bot';
      this.includeTimestamp = options.includeTimestamp !== false;
    }
  
    async execute(reportData) {
      try {
        console.info('Formatting final review comment...');
  
        if (!await this.validate(reportData)) {
          throw new Error('Incomplete report data provided for formatting.');
        }
  
        const header = `## AI Code Review: ${this.botName}\n`;
        
        // Coverage Section (Table)
        const coverageSection = this.formatCoverage(reportData.coverage);
        
        // Best Practice Section (List)
        const rulesSection = this.formatRules(reportData.rules);
  
        // AI Suggestions (Collapsible Details)
        const aiSection = this.formatAiSuggestions(reportData.ai);
  
        const footer = this.includeTimestamp 
          ? `\n---\n_Generated at ${new Date().toLocaleString()}_` 
          : '';
  
        return [header, coverageSection, rulesSection, aiSection, footer].join('\n');
  
      } catch (error) {
        return this.handleError(error);
      }
    }
  
    formatCoverage(coverage) {
      if (!coverage) return '> No coverage data available.';
      return `
  ### Test Coverage
  | Metric | Result | Target | Status |
  | :--- | :--- | :--- | :---: |
  | Lines | ${coverage.lines}% | ${coverage.threshold}% | ${coverage.lines >= coverage.threshold ? 'Passed' : 'Failed'} |
      `.trim();
    }
  
    formatRules(rules = []) {
      if (rules.length === 0) return '### Best Practices\n✅ No style violations found!';
      
      const list = rules.map(r => `- **${r.severity.toUpperCase()}**: ${r.message}`).join('\n');
      return `### Best Practices\n${list}`;
    }
  
    formatAiSuggestions(ai) {
      if (!ai || ai.length === 0) return '';
      
      const items = ai.map(s => `
  <details>
  <summary><b>Line ${s.line}</b>: ${s.issue.substring(0, 50)}...</summary>
  
  **Issue:** ${s.issue}
  **Suggested Fix:**
  \`\`\`javascript
  ${s.fix}
  \`\`\`
  </details>
      `).join('\n');
  
      return `### AI Suggestions\n${items}`;
    }
  
    async validate(data) {
      return data && (data.coverage || data.rules || data.ai);
    }
  
    handleError(err) {
      console.error(`Formatting Error:`, err.message);
      return `> **Internal Error**: The bot failed to format the full report. Please check the logs.`;
    }
  }
  
  module.exports = CommentFormattingHandler;