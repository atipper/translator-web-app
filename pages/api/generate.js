import { Configuration, OpenAIApi } from "openai";
const baseAPI = "https://api.openai.com/v1";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: "https://api.openai.com/v1/chat",
});

const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const { text, language, modelSettings } = req.body;
  if (text.trim().length === 0 || language.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter both text and language",
      },
    });
    return;
  }

  try {
    let completion;
    if (modelSettings.model === "text-davinci-003") {
      completion = await fetch(`${baseAPI}/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${configuration.apiKey}`,
        },
        body: JSON.stringify({
          model: "text-davinci-003",
          prompt: generatePrompt(text, language),
          temperature: 0.6,
        }),
      });
    } else {
      completion = openai.createCompletion({
        model: modelSettings.model,
        messages: modelSettings.messages,
        temperature: 0.6
      })
    }
    const completionData = modelSettings.model === "text-davinci-003" ? await completion.json() : await completion;
    const result =
      modelSettings.model === "text-davinci-003"
        ? completionData.choices[0].text
        : completionData.data.choices[0].message.content;
    res.status(200).json({ result });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(text, language) {
  return `Translate the following text to the specified language.

Source (English): Hello, world!
Target (Japanese): ハローワールド！
Source (English): I hope you have a nice day.
Target (German): Ich hoffe ihr habt einen schönen Tag.
Source (English): ${text}
Target (${language}):`;
}
