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

    // OPTIONAL: If item is a DocumentReference and you want to fetch content:
    if (item.resourceType === "DocumentReference" && item.content?.[0]?.attachment?.url) {
      const attachmentUrl = item.content[0].attachment.url;
      const fetchedContent = await fetch(attachmentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentData = await fetchedContent.text(); // or blob if it's a file

      preparedInput = { ...item, fetchedContent: contentData };
    }

    // Build your AI request here
    const aiRequest = {
      model: "Llama-3.2-11B-Vision-Instruct", // Model identifier
      systemMessage: "you are a healthcare practitioner", // System instruction
      chatMessage: prompt, // Your custom prompt
      base64BinaryData: preparedInput.fetchedContent || "", // If there's a fetched content, send as base64
      base64BinaryDataName: "boneXray.jpg", // The name of the file, adjust if necessary
    };

    // Call the actual AI model
    const aiResponse = await fetch("https://app.meldrx.com/api/23cd739c-3141-4d1a-81a3-697b766ccb56/ai", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(aiRequest),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`❌ AI Error Response: ${errorText}`);
      throw new Error(`AI request failed: ${aiResponse.status} ${aiResponse.statusText} - ${errorText}`);
    }
    

    const aiResult = await aiResponse.json();

    // Return the AI response
    res.status(200).json({ result: aiResult });
  } catch (error: any) {
      console.error(`❌ Handler error:`, error); 
      res.status(500).json({ error: error.message || "Unknown error" });
    }
    
}
