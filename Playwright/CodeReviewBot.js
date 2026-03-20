require('dotenv').config();
const ReviewBot = require('./AIAgent/AICodeReviewBot/ReviewBot');
const GithubIntegrationHandler = require('./AIAgent/AICodeReviewBot/GitHubIntegration'); // Add this import!

// 1. Initialize the Handlers
const bot = new ReviewBot({
    apiKey: process.env.AI_API_KEY
});

const github = new GithubIntegrationHandler({ 
    auth: process.env.GITHUB_AUTH_TOKEN,
    owner: "MrutunjayaThakur", 
    repo: "Automation"         
});

const PR_NUMBER = 3; 

// 2. The Orchestration Logic
async function startReviewProcess() {
    try {
        console.log(`📡 Fetching diff for PR #${PR_NUMBER}...`);
        
        // STEP A: Get the actual code changes from GitHub
        const prDiff = await github.fetchDiff(PR_NUMBER);

        // STEP B: Send that code changes to the AI Bot
        const aiResult = await bot.execute(prDiff);

        if (aiResult.success) {
            console.log("AI Analysis Complete. Posting to GitHub...");

            // STEP C: Post the AI's feedback back to the GitHub PR
            const reviewData = { summary: aiResult.suggestions };
            const githubResult = await github.execute(PR_NUMBER, reviewData);

            console.log("Review Successfully Posted:", githubResult.url);
        } else {
            console.error("AI Review Failed:", aiResult.error);
        }

    } catch (err) {
        console.error("Critical Error in Workflow:", err.message);
    }
}

startReviewProcess();