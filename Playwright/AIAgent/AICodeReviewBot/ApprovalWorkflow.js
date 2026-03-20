
class ApprovalWorkflowHandler {
    constructor(options = {}) {
      this.minCoverage = options.minCoverage || 80;
      this.allowCriticalViolations = false; 
    }
  
    async execute(results) {
      try {
        console.info('Evaluating Approval Criteria...');
  
        const issues = this.identifyBlockers(results);
        const isApproved = issues.length === 0;
  
        return {
          success: true,
          decision: isApproved ? 'APPROVE' : 'REQUEST_CHANGES',
          event: isApproved ? 'APPROVE' : 'REQUEST_CHANGES',
          reason: isApproved 
            ? 'All automated checks passed.' 
            : `Changes requested: Found ${issues.length} blocking issues.`,
          blockers: issues
        };
  
      } 
      catch (err) {
        return this.handleError(err);
      }
    }
  

    // Aggregates failures across different domains.
    identifyBlockers(results) {
      const blockers = [];
  
      // Coverage Blocker
      if (results.coverage && results.coverage.pct < this.minCoverage) {
        blockers.push(`Coverage ${results.coverage.pct}% is below the ${this.minCoverage}% limit.`);
      }
  
      // Critical Rule Blocker
      const criticals = (results.rules || []).filter(r => r.severity === 'critical');
      if (criticals.length > 0) {
        blockers.push(`Found ${criticals.length} critical best-practice violations.`);
      }
  
      // AI Safety Blocker (Optional)
      const highAiIssues = (results.ai || []).filter(s => s.severity === 'high');
      if (highAiIssues.length > 0) {
        blockers.push(`AI detected ${highAiIssues.length} high-risk logic or security flaws.`);
      }
  
      return blockers;
    }
  
    async validate(results) {
      return !!results && typeof results === 'object';
    }
  
    handleError(err) {
      console.error(' Approval Workflow Error:', err.message);
      return { decision: 'COMMENT', reason: 'Internal error during approval check.' };
    }
  }
  
  module.exports = ApprovalWorkflowHandler;