import { NextApiRequest, NextApiResponse } from "next";

const MAX_PROMPT_CHARS = 3000;
const MAX_TEXT_CHARS = 3000;
const MAX_STRING_FIELD_LENGTH = 300; // aggressive trimming

function trimLargeFields(obj: any, maxLength = MAX_STRING_FIELD_LENGTH): any {
  if (typeof obj !== "object" || obj === null) return obj;
  const trimmed: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "string") {
      trimmed[key] = val.length > maxLength ? val.slice(0, maxLength) + "...[truncated]" : val;
    } else if (typeof val === "object") {
      trimmed[key] = trimLargeFields(val, maxLength);
    } else {
      trimmed[key] = val;
    }
  }
  return trimmed;
}

// Estimate token count very roughly (1 token ≈ 4 chars)
function estimateTokenCount(input: string | object): number {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  return Math.ceil(text.length / 4);
}

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

      if ((contentType && contentType.startsWith("image/")) || contentType === "application/pdf") {
        const arrayBuffer = await fetchedContent.arrayBuffer();
        base64Content = Buffer.from(arrayBuffer).toString("base64");
      } else {
        const textContent = await fetchedContent.text();
        preparedInput = {
          ...item,
          fetchedContent: textContent.length > MAX_TEXT_CHARS
            ? textContent.slice(0, MAX_TEXT_CHARS) + "...[truncated]"
            : textContent,
        };
      }
    }

    const trimmedInput = trimLargeFields(preparedInput);

    const aiRequest = {
      model: "Llama-3.2-11B-Vision-Instruct",
      systemMessage: "you are a medical model",
      chatMessage: prompt.slice(0, MAX_PROMPT_CHARS),
      base64BinaryData: base64Content || "",
      base64BinaryDataName: base64Content
        ? "attachment" + (contentType ? `.${contentType.split("/")[1]}` : "")
        : "",
      fhirResource: base64Content
        ? {
            resourceType: item.resourceType,
            id: item.id,
            type: item.type,
          }
        : trimmedInput,
    };

    // Debugging: Estimate token count
    const estimatedTokens = estimateTokenCount(aiRequest);
    console.log(`🧮 Estimated token count: ~${estimatedTokens} tokens`);

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
