// AskButton.jsx

/*
 * This component is used to ask a question to the LLM API route.
 * It fetches & displays the answer from the API route.
 * It also displays the error message if the API returns an error.
 */

import { useState } from "react";
import styles from "./AskButton.module.css";

export default function AskButton({ question, onAnswerReceived, onError }) {
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question || question.trim().length === 0) {
      onError("Please enter a question");
      return;
    }

    setLoading(true);
    // Attempt to fetch from API route
    console.log("Calling API...");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get answer");
      } else {
        console.log("API call successful");
      }

      // Update state passed from parent component, index.js
      const data = await res.json();
      onAnswerReceived(data);
    } catch (error) {
      console.log("-- API error encountered---" && console.error(error));
      onError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className={styles.askButton} onClick={handleAsk} disabled={loading}>
      {loading ? "Asking..." : "Ask"}
    </button>
  );
}
