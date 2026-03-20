const { Octokit } = require("@octokit/rest");

class GithubIntegrationHandler {
  constructor(config = {}) {
    if (!config.auth) {
      throw new Error("GitHub Authentication token is missing.");
    }

    this.octokit = new Octokit({ auth: config.auth });
    this.owner = config.owner;
    this.repo = config.repo;
  }

  
  async execute(pullNumber, reviewData) {
    try {
      console.info(`[GitHub] Processing PR #${pullNumber}...`);

      if (!await this.validate(pullNumber)) {
        return { success: false, reason: "Pull Request not found or inaccessible." };
      }

      // Post a top-level summary comment
      const comment = await this.postSummaryComment(pullNumber, reviewData.summary);

      // Post line-specific comments if provided
      if (reviewData.suggestions?.length > 0) {
        await this.postInlineComments(pullNumber, reviewData.suggestions);
      }

      return {
        success: true,
        commentId: comment.data.id,
        url: comment.data.html_url
      };

    } catch (error) {
      return this.handleError(error);
    }
  }


  // Fetches the raw diff string for a Pull Request.
  async fetchDiff(pullNumber) {
    try {
      const { data } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: pullNumber,
        mediaType: { format: "diff" },
      });
      return data;
    } catch (err) {
      throw new Error(`Failed to fetch diff: ${err.message}`);
    }
  }

  async postSummaryComment(pullNumber, body) {
    return this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: pullNumber,
      body: `###AI Review Bot Analysis\n\n${body}`
    });
  }


  // Validates if the PR is open and we have permissions.
  async validate(pullNumber) {
    try {
      const { data } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: pullNumber
      });
      return data.state === 'open';
    } catch {
      return false;
    }
  }

  handleError(err) {
    console.error(`GitHub Integration Error:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = GithubIntegrationHandler;