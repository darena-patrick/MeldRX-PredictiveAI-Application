export const fetchGeminiResponse = async (prompt: string) => {
  try {
    const res = await fetch(`/api/predict?prompt=${encodeURIComponent(prompt)}`);

    if (!res.ok) {
      const errorText = await res.text(); 
      console.error("Error response from API:", errorText); 
      throw new Error("Failed to fetch analysis from Gemini");
    }

    const data = await res.json();

    return data.insights;
  } catch (error: any) {
    const errorMessage = `An error occurred in the fetchGeminiResponse function: ${error.message}`;
    console.error(errorMessage);
    return errorMessage;
  }
};
