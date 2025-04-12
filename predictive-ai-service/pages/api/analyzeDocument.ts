import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { documents } = req.body;


    if (
      !Array.isArray(documents) ||
      documents.some((doc) => !doc.content_type || !doc.base64_content)
    ) {
      return res.status(400).json({ message: "Invalid or incomplete documents provided" });
    }
    

    // Send the document info to the Python backend
    const backendUrl = process.env.PYTHON_BACKEND_URL;

    if (!backendUrl) {
      return res.status(400).json({ message: "Missing python backend URL" });
    }

    const results = await Promise.all(
      documents.map(async (doc) => {
        try {
          const response = await axios.post(backendUrl, doc, {
            headers: { "Content-Type": "application/json" },
            timeout: 15000, // 15 seconds timeout
          });
          return { status: response.status, data: response.data };
        } catch (err: any) {
          console.error("Error analyzing doc:", err.message);
          return { status: 500, data: { error: err.message } };
        }
      })
    );

    return res.status(200).json({ results });
  } catch (error: any) {
    console.error("Error sending to backend:", error.message);
    return res.status(500).json({ message: "Failed to analyze document", error: error.message });
  }
}
