require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

/* ================================
   ✅ CORS FIX (IMPORTANT)
================================ */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ================================ */
app.use(express.json());
app.use(express.static("public"));

const NEWSAPI_KEY = "8edbc84b5fb94fa8b4e47ea44fc295c1";

/* ================================
   ROOT
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ================================
   FALLBACK DATA
================================ */
function getMockLeadInfo(lead) {
  return `Mock info for ${lead}:
- Name: ${lead}
- Industry: Technology
- Country: United States
- Description: Sample fallback data.`;
}

/* ================================
   API ROUTE
================================ */
app.post("/lead", async (req, res) => {
  const lead = req.body.lead;

  if (!lead) {
    return res.json({ info: "No lead provided" });
  }

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      lead
    )}&pageSize=5&apiKey=${NEWSAPI_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      return res.json({ info: getMockLeadInfo(lead) });
    }

    let info = `Top news about ${lead}:\n\n`;

    data.articles.forEach((a, i) => {
      info += `${i + 1}. ${a.title} (${a.source.name})\n`;
      if (a.description) info += `   ${a.description}\n`;
    });

    res.json({ info });

  } catch (err) {
    console.error(err);
    res.json({ info: getMockLeadInfo(lead) });
  }
});

/* ================================
   EXPORT FOR VERCEL
================================ */
module.exports = app;
