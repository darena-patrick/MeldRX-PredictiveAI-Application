export async function fetchAIResponse(
  prompt: string,
  item: any,
  token: string,
  signal?: AbortSignal,
  retries = 2,
  timeout = 15000
): Promise<{ result?: any; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch("/api/analyzeDataViaMeldRxInfrastructure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, item, token }), // <-- include token here
      signal: signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      return { error: `Server error: ${res.status} - ${errorText}` };
    }

    const data = await res.json();
    return { result: data.result || data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      if (retries > 0) {
        console.warn("⚠️ Timeout occurred, retrying...", retries);
        return await fetchAIResponse(prompt, item, token, undefined, retries - 1, timeout);
      }
      return { error: "Request timed out." };
    }
    return { error: `Unexpected error: ${err.message || err.toString()}` };
  }
}
