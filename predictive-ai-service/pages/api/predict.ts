import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt } = req.query;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ message: "Invalid prompt" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key missing" });
    }

    // Initialize Google Generative AI with Gemini API Key
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Start the chat with the prompt
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    // Send the prompt and get the response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const generatedText = await response.text();

    // Return the generated response as JSON
    return res.status(200).json({ insights: generatedText });
  } catch (error: any) {
    console.error("Error in generating response:", error.message);
    return res.status(500).json({ message: "Failed to generate insights", error: error.message });
  }
}
