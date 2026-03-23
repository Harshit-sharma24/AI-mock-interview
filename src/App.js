import React, { useState } from "react";
import "./App.css";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.REACT_APP_GROQ_KEY,
  dangerouslyAllowBrowser: true
});

function App() {
  const [topic, setTopic] = useState("");
  const [num, setNum] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic || !num || num <= 0) {
      alert("Please enter valid topic and number");
      return;
    }

    setLoading(true);
    setData([]);

    let allData = [];

    for (let i = 0; i < num; i += 10) {
      const chunkSize = Math.min(10, num - i);

      const prompt = `
Give exactly ${chunkSize} interview questions with answers on ${topic}.

Strict format:
Q1: ...
A1: ...
Q2: ...
A2: ...

Rules:
- Exactly ${chunkSize} questions
- हर question ka answer hona chahiye
- Extra kuch mat dena
`;

      try {
        const response = await client.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }]
        });

        const text = response.choices[0].message.content;

        // ✅ Strong regex parsing
        const matches = text.match(/Q\d+:\s*(.*?)\s*A\d+:\s*(.*?)(?=Q\d+:|$)/gs);

        if (matches) {
          matches.forEach((pair) => {
            const qMatch = pair.match(/Q\d+:\s*(.*)/);
            const aMatch = pair.match(/A\d+:\s*(.*)/);

            allData.push({
              question: qMatch?.[1]?.trim() || "Missing question",
              answer: aMatch?.[1]?.trim() || "Missing answer"
            });
          });
        }

      } catch (err) {
        console.error("API Error:", err);
      }
    }

    setData(allData.slice(0, num));
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🤖 AI Mock Interviewer</h1>
      <p className="subtitle">Practice smarter, crack interviews faster 🚀</p>

      <div className="card">

        <div className="form-group">
          <label>Topic</label>
          <input
            type="text"
            placeholder="React, Java, DSA..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Number of Questions</label>
         <input
  type="number"
  placeholder="Enter number (e.g. 5, 10, 50)"
  value={num}
  onChange={(e) => setNum(e.target.value)}
/>
        </div>

        <button onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {/* 🔥 Loader UI */}
        {loading && (
          <div className="loader-box">
            <div className="spinner"></div>
            <p>Generating questions... please wait ⏳</p>
          </div>
        )}

      </div>

      {/* 🔥 Output */}
      <div className="output">
        {data.length > 0 && !loading && (
          <h2 className="result-title">Generated Questions</h2>
        )}

        {data.map((item, index) => (
          <div key={index} className="qa-card">
            <div className="question">
              Q{index + 1}: {item.question}
            </div>

            <div className="answer">
              A{index + 1}: {item.answer}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}


export default App;