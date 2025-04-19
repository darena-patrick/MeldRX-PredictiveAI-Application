import type { NextApiRequest, NextApiResponse } from "next";
import { AzureKeyCredential } from "@azure/core-auth";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";


// Optional: 60 seconds timeout for long image model calls
const IMAGE_TIMEOUT_MS = 60000;
const MAX_TEXT_LENGTH = 12000; // ~8k tokens safe

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const endpoint = "https://models.github.ai/inference";
  const modelName = "meta/Llama-3.2-11B-Vision-Instruct";
  const githubToken = process.env.GITHUB_TOKEN;
  const { document, token: fhirToken } = req.body;

  if (!document || typeof document !== "object" || document.resourceType !== "DocumentReference") {
    return res.status(400).json({ message: "Invalid DocumentReference payload" });
  }

  if (!githubToken) {
    return res.status(400).json({ message: "Missing model access token" });
  }

  try {
    const documentContent = document.content?.[0]?.attachment;
    const { contentType, data, url } = documentContent || {};

    if (!contentType) {
      return res.status(400).json({ message: "Missing attachment contentType" });
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(githubToken));

    // Get content (text or base64 image)
    let content: string | null = null;
    if (data) {
      content = Buffer.from(data, "base64").toString("utf-8");
    } else if (url) {
      const headers: Record<string, string> = {};
      if (fhirToken) headers.Authorization = `Bearer ${fhirToken}`;

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Failed to fetch document from URL: ${response.statusText}`);

      if (contentType.startsWith("text/")) {
        content = await response.text();
      } else {
        const buffer = await response.arrayBuffer();
        content = `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
      }
    } else {
      return res.status(400).json({ message: "No content data or url found" });
    }

    // Detect if image or text
    const isImage = contentType.startsWith("image/");

    // Handle token truncation for long text
    const textInput = !isImage ? content?.slice(0, MAX_TEXT_LENGTH) : null;

    const messages = isImage
      ? [
          { role: "system", content: "You are a helpful assistant that describes medical images." },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this medical image and identify key findings." },
              { type: "image_url", image_url: { url: content!, details: "low" } },
            ],
          },
        ]
      : [
          { role: "system", content: "You are a helpful assistant that summarizes and analyzes clinical notes." },
          { role: "user", content: textInput },
        ];

    console.log("[Document Type]", contentType);
    console.log("[Model Messages]", messages);

    const requestBody = {
      model: modelName,
      messages,
      max_tokens: 1500,
      temperature: 0.5,
      top_p: 1.0,
      // stream: true, // Enable this if frontend supports streaming
    };

    const fetchModelResponse = () =>
      client.path("/chat/completions").post({ body: requestBody });

    // Image requests may hang, so add a timeout wrapper
    const modelResponse = isImage
  ? (await Promise.race([
      fetchModelResponse(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Image analysis timed out")), IMAGE_TIMEOUT_MS)
      ),
    ])) as any
  : await fetchModelResponse();

    if (isUnexpected(modelResponse)) {
      throw modelResponse.body.error;
    }

    const result = modelResponse.body.choices?.[0]?.message?.content;
    return res.status(200).json({ analysis: result });

  } catch (error: any) {
    console.error("Document analysis error:", error);
    return res.status(500).json({
      message: "Failed to analyze the document",
      error: error.message,
    });
  }
}
