import { NextApiRequest, NextApiResponse } from "next";

const MAX_TEXT_LENGTH = 12000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { item, prompt, token } = req.body;

  if (!item || !prompt) {
    return res.status(400).json({ error: "Missing required fields: item or prompt" });
  }

  try {
    let preparedInput = item;
    let base64Content: string | null = null;
    let contentType: string | null = null;

    if (item.resourceType === "DocumentReference" && item.content?.[0]?.attachment?.url) {
      const attachment = item.content[0].attachment;
      const attachmentUrl = attachment.url;
      contentType = attachment.contentType || "application/octet-stream";

      const fetchedContent = await fetch(attachmentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!fetchedContent.ok) {
        throw new Error(`Failed to fetch attachment: ${fetchedContent.statusText}`);
      }

      const blob = await fetchedContent.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // 🛠 Wrap in data URI if it's an image or PDF
      if (contentType && contentType.startsWith("image/") || contentType === "application/pdf") {
        base64Content = `data:${contentType};base64,${base64}`;
      } else {
        // Assume text for others
        const textContent = await fetchedContent.text();
        preparedInput = { ...item, fetchedContent: textContent };
      }
    }

    const aiRequest = {
      model: "Llama-3.2-11B-Vision-Instruct",
      systemMessage: "you are a medical model",
      chatMessage: prompt,
      base64BinaryData: base64Content || "",
      base64BinaryDataName: "attachment" + (contentType ? `.${contentType.split("/")[1]}` : ""),
      fhirResource: preparedInput, // generic support
    };

    const azureToken = process.env.AZURE_TOKEN;
    if (!azureToken) {
      return res.status(400).json({ message: "Missing azure access token" });
    }

    const aiResponse = await fetch("https://app.meldrx.com/api/23cd739c-3141-4d1a-81a3-697b766ccb56/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(aiRequest),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`❌ AI Error Response: ${errorText}`);
      throw new Error(`AI request failed: ${aiResponse.status} ${aiResponse.statusText} - ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    res.status(200).json({ result: aiResult });

  } catch (error: any) {
    console.error(`❌ Handler error:`, error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
}
