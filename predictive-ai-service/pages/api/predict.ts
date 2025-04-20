import type { NextApiRequest, NextApiResponse } from "next";
import { AzureKeyCredential } from "@azure/core-auth";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const endpoint = "https://models.github.ai/inference";
  const modelName = "meta/Llama-3.2-11B-Vision-Instruct";
  const { prompt } = req.query;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ message: "Missing or invalid prompt" });
  }

  if (!githubToken) {
    return res.status(400).json({ message: "Missing model access token" });
  }

  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(githubToken));

    const requestBody = {
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes clinical data and provides structured medical insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.5,
      top_p: 1.0,
    };

    const modelResponse = await client.path("/chat/completions").post({ body: requestBody });

    if (isUnexpected(modelResponse)) {
      throw modelResponse.body.error;
    }

    const result = modelResponse.body.choices?.[0]?.message?.content;
    return res.status(200).json({ insights: result });
  } catch (error: any) {
    console.error("Error generating model insights:", error.message);
    return res.status(500).json({ message: "Failed to generate insights", error: error.message });
  }
}
