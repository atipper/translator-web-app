import { Configuration, OpenAIApi } from "openai";

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

  const text = req.body.text || "";
  const language = req.body.language || "";
  if (text.trim().length === 0 || language.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter both text and language",
      },
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You will act as an expert language translator. Observe the provided text and provide an accurate translation to ${language}:`,
        },
        { role: "user", content: `${text}` },
      ],
    });
    const result = completion.data.choices[0].message.content;
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
