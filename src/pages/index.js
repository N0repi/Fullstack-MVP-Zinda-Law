// index.js

import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "./index.module.css";
import AskButton from "./Components/AskButton";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  // Load dark mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  // Cache dark mode preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAnswerReceived = (data) => {
    setAnswer(data);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setAnswer(null);
  };

  return (
    <main className={`${styles.main} ${darkMode ? styles.dark : ""}`}>
      <Head>
        <title>Zinda Law Q&A</title>
        <meta name="description" content="Legal FAQ assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Dark Mode Toggle Button */}
      <button
        className={styles.darkModeToggle}
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className={styles.page}>
        <h1>Zinda Law Q&A Assistant</h1>
        <p>Ask your legal questions and get AI-powered answers</p>

        <div className={styles.mutableForm}>
          <input
            type="text"
            placeholder="Ask a question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                document.querySelector(`.${styles.mutableForm} button`).click();
              }
            }}
          />
          <AskButton
            question={question}
            onAnswerReceived={handleAnswerReceived}
            onError={handleError}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Answer Display */}
        {answer && (
          <div className={styles.answerContainer}>
            <h2>Answer:</h2>
            <p className={styles.answer}>{answer.answer}</p>

            {answer.retrievedFaqs && answer.retrievedFaqs.length > 0 && (
              <div className={styles.faqsContainer}>
                <h3>Related FAQs:</h3>
                {answer.retrievedFaqs.map((faq) => (
                  <div key={faq.id} className={styles.faqCard}>
                    <h4>{faq.question}</h4>
                    <p>{faq.answer}</p>
                    <div className={styles.faqMeta}>
                      <span className={styles.category}>{faq.category}</span>
                      <span className={styles.score}>
                        Relevance: {faq.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
