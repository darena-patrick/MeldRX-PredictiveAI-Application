import { useRef } from "react";
import PQueue from "p-queue";
import { fetchAIResponse } from "@/utils/serverAPICalls";

type FetchFn = (item: any) => Promise<{ content: string; contentType: string }>;

export const useAIQueue = () => {
  const queueRef = useRef(
    new PQueue({
      concurrency: 5,
      intervalCap: 24,
      interval: 60000,
    })
  );

  const retryFetch = async (
    prompt: string,
    retries = 2,
    timeout = 15000
  ): Promise<any> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        console.log('fetching ai response...');
        const response = await queueRef.current.add(() =>
          fetchAIResponse(prompt, controller.signal)
        );
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
    item: any,
    type: string,
    customPrompt?: (item: any) => string,
    fetchFn?: FetchFn
  ) => {
    return queueRef.current.add(async () => {
      let prompt = customPrompt
        ? customPrompt(item)
        : `Analyze the following ${type}:\n${JSON.stringify(item, null, 2)}`;

      if (fetchFn) {
        const { content, contentType } = await fetchFn(item);
        prompt = `Analyze the document (${contentType}):\n${content}`;
      }

      // console.log(`📤 Prompt for ${type}:`, prompt.slice(0, 200));
      console.log(`Prompt for type ${JSON.stringify(type)}  *** of item ${item}: prompt starts - ${JSON.stringify(prompt)}`);
      return await retryFetch(prompt);
    });
  };

  return {
    queue: queueRef.current,
    analyzeItem,
    retryFetch,
  };
};
