import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "@/app/redux/store";

const AnalyzeDocumentsButton: React.FC = () => {
  const documents = useSelector((state: RootState) => state.documents);

  const handleAnalyze = async () => {
    try {
      const response = await axios.post("/api/analyzeDocument", {
        documents,
      });

      console.log("Analysis result:", response.data);
      // You could dispatch another action here to store the response in Redux if needed
    } catch (error: any) {
      console.error("Failed to analyze documents:", error.message);
    }
  };

  return (
    <button
      onClick={handleAnalyze}
      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
    >
      Analyze Documents
    </button>
  );
};

export default AnalyzeDocumentsButton;
