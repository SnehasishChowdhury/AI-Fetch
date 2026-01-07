require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// ⚠️ HARDCODED API KEY (NOT RECOMMENDED FOR PROD)
const NEWSAPI_KEY = "8edbc84b5fb94fa8b4e47ea44fc295c1";

// ROOT ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      lead
    )}&pageSize=5&apiKey=${NEWSAPI_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "ok" || !data.articles || data.articles.length === 0) {
      return res.json({ info: getMockLeadInfo(lead) });
    }

    let info = `Top news about ${lead}:\n\n`;
    data.articles.forEach((article, index) => {
      info += `${index + 1}. ${article.title} (${article.source.name})\n`;
      if (article.description) info += `   ${article.description}\n`;
    });

    res.json({ info });
  } catch (err) {
    res.json({ info: getMockLeadInfo(lead) });
  }
});

module.exports = app;
