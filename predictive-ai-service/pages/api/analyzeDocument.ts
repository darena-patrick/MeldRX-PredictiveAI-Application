import type { NextApiRequest, NextApiResponse } from "next";

interface DocumentInput {
  content_type: string;
  base64_content: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { content_type, base64_content } = req.body as DocumentInput;

    if (!content_type || !base64_content) {
      return res.status(400).json({ message: "Missing content_type or base64_content" });
    }

    // Send the document info to the Python backend
    const backendUrl = process.env.PYTHON_BACKEND_URL;

    if (!backendUrl) {
      return res.status(400).json({ message: "Missing python backend URL" });
    }

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content_type, base64_content }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: "Backend error", details: data });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error sending to backend:", error.message);
    return res.status(500).json({ message: "Failed to analyze document", error: error.message });
  }
}
