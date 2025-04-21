import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { document, token } = req.body;

  try {
    const attachment = document.content?.[0]?.attachment;
    const { contentType, data, url } = attachment || {};

    if (!contentType) return res.status(400).json({ message: "Missing contentType" });

    let content: string | null = null;

    if (data) {
      content = Buffer.from(data, "base64").toString("utf-8");
    } else if (url) {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Fetch error: ${response.statusText}`);

      if (contentType.startsWith("text/")) {
        content = await response.text();
      } else {
        const buffer = await response.arrayBuffer();
        content = `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
      }

      throw new Error(`DEBUG: ${content}`);
    }

    if (!content) return res.status(400).json({ message: "No content found" });

    res.status(200).json({ content, contentType });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch document content", error: err.message });
  }
}
