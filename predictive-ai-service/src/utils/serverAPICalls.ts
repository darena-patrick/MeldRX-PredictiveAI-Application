export const fetchAIResponse = async (prompt: string) => {
  try {
    const res = await fetch(`/api/predict?prompt=${encodeURIComponent(prompt)}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", errorText);
      return { error: `API Error: ${errorText}` };  // Return as object
    }

    const data = await res.json();
    return data.insights ? { result: data.insights } : { error: "No insights returned" };
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { error: `Fetch error: ${error.message || "Unknown error"}` };
  }
};
