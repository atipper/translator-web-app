import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [result, setResult] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  async function onSubmit(event) {
    event.preventDefault();
    try {
      let modelSettings;
      if (model === "gpt-3.5-turbo" || model === "gpt-4") {
        modelSettings = {
          model: model,
          messages: [
            {
              role: "system",
              content: `You will act as an expert language translator. Observe the provided text and provide an accurate translation to ${selectedLanguage}:`,
            },
            { role: "user", content: `${textInput}` },
          ],
        };
      } else if (model === "text-davinci-003") {
        modelSettings = {
          model: model,
        };
      }
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textInput,
          language: selectedLanguage,
          modelSettings: modelSettings,
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(data.result);
      setTextInput("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  function handleKeyPress(event) {
    if (event.key === "Enter") {
      onSubmit(event);
    }
  }

  const predefinedLanguages = [
    { label: "English", value: "English" },
    { label: "French", value: "French" },
    { label: "Spanish", value: "Spanish" },
    { label: "German", value: "German" },
    { label: "Italian", value: "Italian" },
    { label: "Japanese", value: "Japanese" },
    { label: "Chinese", value: "Chinese" },
    { label: "Russian", value: "Russian" },
    { label: "Korean", value: "Korean" },
  ];

  return (
    <div>
      <Head>
        <title>AI Translation</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Translate Text</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="text"
            placeholder="Enter text to translate"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <select
            name="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="">Select a language</option>
            {predefinedLanguages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
          <select
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="gpt-4">gpt-4</option>
            <option value="text-davinci-003">text-davinci-003</option>
            {/* Add other model options if needed */}
          </select>
          <input type="submit" value="Translate" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
}
