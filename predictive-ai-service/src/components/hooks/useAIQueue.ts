"use client";

import { RootState } from "@/app/redux/store";
import { fetchAIResponse } from "@/utils/serverAPICalls";
import { useSelector } from "react-redux";

type FetchFn = (item: any) => Promise<{ content: string; contentType: string }>;

export const useAIQueue = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const retryFetch = async (
    item: any,    
    prompt: string,
    retries = 2,
    timeout = 15000
  ): Promise<any> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        console.log('fetching ai response...');
        const response = await fetchAIResponse(prompt, item, token, controller.signal);

        console.log('AI response fetched: ' + JSON.stringify(response));
        clearTimeout(timeoutId);
        return response;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (attempt === retries) {
          console.error(`❌ Final attempt failed for prompt:`, prompt);
          throw err;
        } else {
          console.warn(`⏳ Retry ${attempt + 1} for prompt:`, prompt);
        }
      }
    }
  };

  const analyzeItem = async (
    type: string,
    item: any,
    customPrompt?: (item: any) => string,
    fetchFn?: FetchFn
  ) => {
    let prompt = customPrompt
      ? customPrompt(item)
      : `Analyze the following ${type}:\n${JSON.stringify(item, null, 2)}`;

    // If fetchFn is provided (e.g., for documents), call it first
    if (fetchFn) {
      const { content, contentType } = await fetchFn(item);
      prompt = `Analyze this ${type} content (Content-Type: ${contentType}):\n${content}`;
    }

    return await retryFetch(item, prompt); 
  };

  return { analyzeItem };
};
