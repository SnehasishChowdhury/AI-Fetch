require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

// Helper function for mock/fallback data
function getMockLeadInfo(lead) {
  return `Mock info for ${lead}:
- Name: ${lead}
- Industry: Technology
- Country: United States
- Description: This is sample data for testing purposes.`;
}

app.post("/lead", async (req, res) => {
  const lead = req.body.lead;

  try {
    // Build NewsAPI URL
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      lead
    )}&pageSize=5&apiKey=${NEWSAPI_KEY}`;

    console.log("Fetching URL:", url); // log for debugging

    const response = await fetch(url);
    const data = await response.json();

    console.log("NewsAPI response:", data); // log for debugging

    // If NewsAPI fails or returns no articles, use mock data
    if (data.status !== "ok" || !data.articles || data.articles.length === 0) {
      return res.json({ info: getMockLeadInfo(lead) });
    }

    // Prepare summary from articles
    let info = `Top news about ${lead}:\n\n`;
    data.articles.forEach((article, index) => {
      info += `${index + 1}. ${article.title} (${article.source.name})\n`;
      if (article.description) info += `   ${article.description}\n`;
    });

    res.json({ info });
  } catch (err) {
    console.error("Error fetching NewsAPI:", err);
    res.json({ info: getMockLeadInfo(lead) });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
