import { NextApiRequest, NextApiResponse } from 'next';

const MAX_TEXT_LENGTH = 12000; // ~8k tokens safe

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { item, prompt, token } = req.body;

  if (!item || !prompt) {
    return res.status(400).json({ error: "Missing required fields: item or prompt" });
  }

  try {
    let base64Content: string | null = null;
    let textInput: string | null = null;
    const resourceType = item.resourceType;

    if (resourceType === "DocumentReference") {
      const attachment = item.content?.[0]?.attachment;
      const attachmentUrl = attachment?.url;
      const contentType = attachment?.contentType || "";

      if (!attachmentUrl) {
        return res.status(400).json({ error: "Missing DocumentReference attachment URL" });
      }

      const fetchedContent = await fetch(attachmentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!fetchedContent.ok) {
        throw new Error(`Failed to fetch attachment: ${fetchedContent.statusText}`);
      }

      if (contentType.startsWith("image/") || contentType.startsWith("application/pdf")) {
        const blob = await fetchedContent.blob();
        const arrayBuffer = await blob.arrayBuffer();
        base64Content = Buffer.from(arrayBuffer).toString('base64');
      } else {
        const fullText = await fetchedContent.text();
        textInput = fullText.slice(0, MAX_TEXT_LENGTH);
        if (fullText.length > MAX_TEXT_LENGTH) {
          textInput += "\n\n[Note: Document was truncated due to size limits.]";
        }
      }
    } else {
      // For non-DocumentReference resources, uses the FHIR JSON content as input
      const fhirText = JSON.stringify(item, null, 2);
      textInput = fhirText.slice(0, MAX_TEXT_LENGTH);
      if (fhirText.length > MAX_TEXT_LENGTH) {
        textInput += "\n\n[Note: Resource was truncated due to size limits.]";
      }
    }

    const aiRequest = {
      model: "Llama-3.2-11B-Vision-Instruct",
      systemMessage: "You are a medical model that can interpret FHIR data.",
      chatMessage: `${prompt}\n\nFHIR Resource:\n${textInput || "[Binary data attached]"}`,
      base64BinaryData: base64Content || "",
      base64BinaryDataName: "attachment.bin", // Could be improved with MIME-based filename logic
    };

    const azureToken = process.env.AZURE_TOKEN;

    if (!azureToken) {
      return res.status(400).json({ message: "Missing azure access token" });
    }

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
    res.status(200).json({ result: aiResult });

  } catch (error: any) {
    console.error(`❌ Handler error:`, error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
}
