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

  const retryFetch = async (prompt: string, retries = 2): Promise<any> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await queueRef.current.add(() => fetchAIResponse(prompt));
      } catch (err) {
        if (attempt === retries) throw err;
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
        : `Analyze the following ${type}:\n${JSON.stringify(item)}`;

      if (fetchFn) {
        const { content, contentType } = await fetchFn(item);
        prompt = `Analyze the document (${contentType}):\n${content}`;
      }

      return await retryFetch(prompt);
    });
  };

  return {
    queue: queueRef.current,
    analyzeItem,
    retryFetch,
  };
};
