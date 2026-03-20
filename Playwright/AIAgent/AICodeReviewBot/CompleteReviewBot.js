
class CompleteReviewBotHandler {
    constructor(handlers) {
      this.parser = handlers.parser;
      this.coverage = handlers.coverage;
      this.rules = handlers.rules;
      this.ai = handlers.ai;
      this.github = handlers.github;
      this.formatter = handlers.formatter;
      this.workflow = handlers.workflow;
    }
  
    async execute(pullRequestId) {
      try {
        console.info(`---Starting Full Review for PR #${pullRequestId} ---`);
  
        // Fetch the raw data from GitHub
        const diff = await this.github.fetchDiff(pullRequestId);
        const { sourceCode } = await this.github.getFiles(pullRequestId);
  
        // Run independent checks in PARALLEL to save time
        console.info('Running concurrent analysis...');
        const [ast, coverageReport] = await Promise.all([
          this.parser.execute(sourceCode),
          this.coverage.execute()
        ]);
  
        // Run Logic Checks (Rules + AI)
        const [ruleViolations, aiSuggestions] = await Promise.all([
          this.rules.execute(ast, sourceCode),
          this.ai.execute(diff, 'source_file.js')
        ]);
  
        // Compile Results & Format
        const fullReport = {
          coverage: coverageReport.data,
          rules: ruleViolations.violations,
          ai: aiSuggestions.suggestions
        };
  
        const markdownComment = await this.formatter.execute(fullReport);
        
        // Final Decision & Post to GitHub
        const decision = await this.workflow.execute(fullReport);
        
        await this.github.postReview(pullRequestId, {
          body: markdownComment,
          event: decision.event 
        });
  
        console.info(`---Review Complete: ${decision.decision} ---`);
        return { success: true, decision: decision.decision };
  
      } catch (error) {
        return this.handleGlobalError(error, pullRequestId);
      }
    }
  
    async validate(id) {
      return !!id && !isNaN(id);
    }
  
    handleGlobalError(err, prId) {
      console.error(`Critical Orchestration Failure on PR #${prId}:`, err.message);
      this.github.postComment(prId, `**Review Bot Error**: Something went wrong during analysis.`);
      return { success: false, error: err.message };
    }
  }
  
  module.exports = CompleteReviewBotHandler;