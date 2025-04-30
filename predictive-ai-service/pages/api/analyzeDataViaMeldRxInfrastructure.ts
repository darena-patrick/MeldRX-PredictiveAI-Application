import { NextApiRequest, NextApiResponse } from 'next';

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

    if (item.resourceType === "DocumentReference" && item.content?.[0]?.attachment?.url) {
      const attachmentUrl = item.content[0].attachment.url;
      const contentType = item.content[0].attachment.contentType || "";

      const fetchedContent = await fetch(attachmentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!fetchedContent.ok) {
        throw new Error(`Failed to fetch attachment: ${fetchedContent.statusText}`);
      }

      if (contentType.startsWith("image/") || contentType.startsWith("application/pdf")) {
        // Binary file → Blob → Base64
        const blob = await fetchedContent.blob();
        const arrayBuffer = await blob.arrayBuffer();
        base64Content = Buffer.from(arrayBuffer).toString('base64');
      } else {
        // Text file → plain text
        const textContent = await fetchedContent.text();
        preparedInput = { ...item, fetchedContent: textContent };
      }
    }

    // const aiRequest = {
    //   model: "Llama-3.2-11B-Vision-Instruct",
    //   systemMessage: "you are a healthcare practitioner",
    //   chatMessage: prompt,
    //   base64BinaryData: base64Content || "", // base64 only for binary
    //   base64BinaryDataName: "attachment", // optional
    // };

    // const aiResponse = await fetch("https://app.meldrx.com/api/23cd739c-3141-4d1a-81a3-697b766ccb56/ai", {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: JSON.stringify(aiRequest),
    // });

    
  const azureToken = process.env.AZURE_TOKEN;

  if (!azureToken) {
    return res.status(400).json({ message: "Missing azure access token" });
  }

  const aiResponse = await fetch("https://meldrx-demo-ai.services.ai.azure.com/models/Llama-3.2-11B-Vision-Instruct:generate", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': azureToken,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "you are a healthcare practitioner" },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500,
      top_p: 1.0
    }),
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
