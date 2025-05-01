"use client";

import { RootState } from "@/app/redux/store";
import { fetchAIResponse } from "@/utils/serverAPICalls";
import { useSelector } from "react-redux";

type FetchFn = (item: any) => Promise<{ content: string; contentType: string }>;

// Helper function to fetch document content from URL
const fetchDocumentContent = async (item: any): Promise<{ content: string; contentType: string }> => {
  const attachment = item.content?.[0]?.attachment;
  const attachmentUrl = attachment?.url;
  const contentType = attachment?.contentType || "application/octet-stream";

  if (!attachmentUrl) {
    throw new Error("DocumentReference does not contain a valid URL.");
  }

  // Fetch the document content
  const response = await fetch(attachmentUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch document content: ${response.statusText}`);
  }

  let content = "";
  if (contentType.startsWith("image/") || contentType === "application/pdf") {
    const arrayBuffer = await response.arrayBuffer();
    content = Buffer.from(arrayBuffer).toString("base64"); // Convert to base64
  } else {
    content = await response.text(); // For textual content
  }

  return { content, contentType };
};

export const useAIQueue = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  // Retry mechanism for fetch operations
  const retryFetch = async (
    item: any,
    prompt: string,
    retries = 2,
    timeout = 30000 // increased to 30 seconds
  ): Promise<any> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        console.log("⚙️ Fetching AI response...");
        const response = await fetchAIResponse(prompt, item, token, controller.signal);

        console.log("✅ AI response fetched: " + JSON.stringify(response));
        clearTimeout(timeoutId);
        return response;
      } catch (err: any) {
        clearTimeout(timeoutId);

        const isFinalAttempt = attempt === retries;
        const errMsg = typeof err?.message === "string" ? err.message : "";
        const shouldRetry =
          errMsg.includes("504") ||
          errMsg.includes("FUNCTION_INVOCATION_TIMEOUT") ||
          errMsg.includes("ECONNRESET") ||
          errMsg.includes("timeout") ||
          err.name === "AbortError";

        if (!shouldRetry || isFinalAttempt) {
          console.error(`❌ Final attempt failed (attempt ${attempt + 1}):`, errMsg || err);
          throw err;
        } else {
          console.warn(`⏳ Retrying (attempt ${attempt + 1}) after error: ${errMsg}`);
          await new Promise((res) => setTimeout(res, 1000 * (attempt + 1))); // simple backoff
        }
      }
    }
  };

  // Analyze a specific item
  const analyzeItem = async (
    type: string,
    item: any,
    customPrompt?: (item: any) => string,
    fetchFn?: FetchFn
  ) => {
    let prompt = customPrompt
      ? customPrompt(item)
      : `Analyze the following ${type}:\n${JSON.stringify(item, null, 2)}`;

    // If the item is a DocumentReference, handle content fetching before analysis
    if (type === "DocumentReference") {
      const { content, contentType } = await fetchDocumentContent(item);
      prompt = `Analyze this ${type} content (Content-Type: ${contentType}):\n${content}`;
    } else if (fetchFn) {
      // If fetchFn is provided (for custom types like documents), call it first
      const { content, contentType } = await fetchFn(item);
      prompt = `Analyze this ${type} content (Content-Type: ${contentType}):\n${content}`;
    }

    return await retryFetch(item, prompt);
  };

  return { analyzeItem };
};
