
class AiSuggestionsHandler {
    constructor(aiClient, options = {}) {
      this.client = aiClient; 
      this.model = options.model || 'gpt-4o';
      this.temperature = options.temperature || 0.2; 
    }
  
    async execute(codeSnippet, fileName) {
      try {
        console.info(`Requesting AI analysis for: ${fileName}`);
  
        if (!this.validate(codeSnippet)) {
          return { success: false, reason: "Snippet too small or too large for AI context." };
        }
  
        // Construct a 'System Prompt' to force a specific output format
        const systemPrompt = this.getSystemPrompt(fileName);
  
        // Call the AI
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Review this code:\n\n${codeSnippet}` }
          ],
          temperature: this.temperature,
          response_format: { type: "json_object" }
        });
  
        // Parse the result
        const result = JSON.parse(response.choices[0].message.content);
  
        return {
          success: true,
          suggestions: result.suggestions || [],
          usage: response.usage 
        };
  
      } catch (error) {
        return this.handleError(error);
      }
    }
  
    
    getSystemPrompt(fileName) {
      return `
        You are an Automation Test Engineer expert reviewing a ${fileName} file.
        Provide code suggestions in a JSON format:
        {
          "suggestions": [
            { "line": number, "issue": "string", "fix": "string", "severity": "low|med|high" }
          ]
        }
        Focus on: Performance, Security, and Readability. Be concise.
      `.trim();
    }
  
    validate(code) {
      return code && code.length > 20 && code.length < 20000;
    }
  
    handleError(err) {
      console.error(`AI Suggestion Error:`, err.message);
      if (err.status === 429) return { success: false, error: "Rate limit exceeded. Try again later." };
      return { success: false, error: "AI service failed to respond." };
    }
  }
  
  module.exports = AiSuggestionsHandler;