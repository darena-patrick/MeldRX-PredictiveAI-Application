export const fetchAIResponse = async (prompt: string) => {
  try {
    console.log('fetching with prompt', prompt);
    const res = await fetch(`/api/predict?prompt=${encodeURIComponent(prompt)}`);

    if (!res.ok) {
      const errorText = await res.text(); 
      console.error("Error response from API:", errorText); 
      throw new Error("Failed to fetch analysis from AI model");
    }

    const data = await res.json();
    console.log('AI response:', data);
    return data.insights;
  } catch (error: any) {
    const errorMessage = `An error occurred in the fetchAIResponse function: ${error.message}`;
    console.error(errorMessage);
    return errorMessage;
  }
};
