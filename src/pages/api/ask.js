// api/ask.js

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { promptParams } from "../../utils/prompt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body;

    // Validate input
    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Retrieve relevant FAQs
    const faqs = loadFAQs();
    const retrievedFaqs = retrieveRelevantFAQs(question, faqs, 2);

    // Generate AI answer
    const answer = await generateAnswer(question, retrievedFaqs);

    // Logs output
    const interaction = {
      timestamp: new Date().toISOString(),
      question: question.trim(),
      retrievedFaqIds: retrievedFaqs.map((faq) => faq.id),
      answer,
    };
    logInteraction(interaction);

    // Return response
    return res.status(200).json({
      answer,
      retrievedFaqs,
      timestamp: interaction.timestamp,
    });
  } catch (error) {
    console.error("Error in /api/ask:", error);
    return res.status(500).json({
      error: "Failed to process question",
      message: error.message,
    });
  }
}

/**
 * Load FAQs from JSON file, faqs.json
 */
function loadFAQs() {
  const faqPath = path.join(process.cwd(), "data", "faqs.json");
  const fileContents = fs.readFileSync(faqPath, "utf8");
  const data = JSON.parse(fileContents);
  return data.faqs;
}

/**
 * Retrieve most relevant FAQs using simple keyword matching
 * Returns top N FAQs sorted by relevance score
 *
 * Removed caching mechanism due to needing to restart server to clear cahce. Not worth it for a small project.
 */
function retrieveRelevantFAQs(question, faqs, topN = 2) {
  const questionLower = question.toLowerCase();
  const questionWords = questionLower
    .split(/\s+/)
    .filter((word) => word.length > 2); // Filter out short words

  // Calculate simplerelevance score for each FAQ
  const scoredFaqs = faqs.map((faq) => {
    let score = 0;
    const faqText = `${faq.question} ${faq.answer} ${faq.tags.join(
      " "
    )}`.toLowerCase();

    // Score based on keyword matches
    questionWords.forEach((word) => {
      if (faqText.includes(word)) {
        score += 1;
      }
    });

    // Bonus points for matches in question vs answer
    const faqQuestionLower = faq.question.toLowerCase();
    questionWords.forEach((word) => {
      if (faqQuestionLower.includes(word)) {
        score += 2;
      }
    });

    // Bonus for tag matches
    faq.tags.forEach((tag) => {
      if (questionLower.includes(tag.toLowerCase())) {
        score += 1.5;
      }
    });

    return { ...faq, score };
  });

  // Sort by score and return top N
  return scoredFaqs
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .filter((faq) => faq.score > 0); // Only return FAQs with some relevance
}

/**
 * Generate AI answer using OpenAI API
 * Uses retrieved FAQs as context
 */
async function generateAnswer(question, retrievedFaqs) {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY not configured. Ensure you have an API key in your `.env` file."
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build context from retrieved FAQs
  let context = "";
  if (retrievedFaqs.length > 0) {
    context = "Relevant information from our FAQ database:\n\n";
    retrievedFaqs.forEach((faq, index) => {
      context += `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}\n\n`;
    });
  } else {
    context = "No relevant FAQs found.\n\n";
  }

  // Use the prompt from utils
  const systemPrompt = promptParams;

  const userPrompt = `${context}User Question: ${question}\n\nPlease provide a helpful answer based on the information above.`;

  // Call OpenAI API  |  Using GPT-4 Turbo, but other models should work -> GPT 5 uses a different system than temperature.
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content;
}

/**
 * Log interaction to file system
 * Stores in data/logs/interactions.jsonl (JSON Lines format)
 */
function logInteraction(interaction) {
  try {
    const logsDir = path.join(process.cwd(), "data", "logs");
    const logFile = path.join(logsDir, "interactions.jsonl");

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Append interaction as JSON line
    const logLine = JSON.stringify(interaction) + "\n";
    fs.appendFileSync(logFile, logLine, "utf8");
  } catch (error) {
    console.error("Error logging interaction:", error);
    // Don't throw - logging failure shouldn't break the API response
  }
}
