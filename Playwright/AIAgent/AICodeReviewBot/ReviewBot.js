const OpenAI = require('openai');
const { default: pLimit } = require('p-limit');

class ReviewBotError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "ReviewBotError";
    this.statusCode = statusCode;
  }
}

class ReviewBotIntroHandler {
  constructor({ apiKey, model = 'gpt-4o', maxTokens = 2000 }) {
    if (!apiKey) {
      throw new ReviewBotError("API Key is required to initialize the bot.", 401);
    }

    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.maxTokens = maxTokens;
    this.concurrencyLimit = pLimit(3);
  }

  async execute(pullRequestDiff) {
    try {
      console.info(`[${new Date().toISOString()}] 🚀 AI Engine: Analyzing code diff...`);

      if (!await this.validate(pullRequestDiff)) {
        throw new ReviewBotError("The provided diff is empty or exceeds the size limit (50KB).", 400);
      }

      const aiResponse = await this.getAiFeedback(pullRequestDiff);
      return this.formatReview(aiResponse);

    } catch (error) {
      return this.handleError(error);
    }
  }

  async validate(diff) {
    const MAX_SIZE = 50 * 1024;
    if (!diff || typeof diff !== 'string') return false;
    return diff.length > 0 && diff.length < MAX_SIZE;
  }

  async getAiFeedback(diff) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a Senior QA Automation Engineer and Software Architect. 
            Your goal is to perform a rigorous code review on the provided Git diff.
            
            Focus on:
            1. Logic errors or potential bugs.
            2. Performance bottlenecks.
            3. Security vulnerabilities (e.g., hardcoded secrets).
            4. Playwright/Automation best practices (if applicable).
            5. Readability and Clean Code principles.

            Format your response clearly using Markdown. Use bold headers for issues and code blocks for suggested fixes.`
          },
          { role: "user", content: `Review this diff:\n${diff}` }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.1, 
      });

      return response.choices[0].message.content;
    } 
    catch (apiError) {
      throw new ReviewBotError(`AI Provider Error: ${apiError.message}`, 502);
    }
  }

  formatReview(content) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      model: this.model,
      suggestions: content,
      metadata: {
        status: "completed"
      }
    };
  }

  handleError(err) {
    const statusCode = err.statusCode || 500;
    console.error(`[ReviewBot ERROR] ${err.name} (${statusCode}): ${err.message}`);

    return {
      success: false,
      error: err.message,
      code: statusCode
    };
  }
}

module.exports = ReviewBotIntroHandler;