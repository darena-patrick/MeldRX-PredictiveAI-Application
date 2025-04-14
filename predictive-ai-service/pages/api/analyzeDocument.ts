import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    try {
      const response = await axios.post(`${backendUrl}/analyze-document`, {
        documents,
      });
  
      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error("Backend error:", error.response?.data || error.message);
      return res.status(500).json({
        message: `Error communicating with backend for payload ${JSON.stringify({ documents: document }, null, 2)}`,
        error: error.response?.data || error.message,
      });
    }
}
