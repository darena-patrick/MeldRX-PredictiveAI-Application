import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "@/app/redux/store";

const AnalyzeDocumentsButton: React.FC = () => {
  const documents = useSelector(
    (state: RootState) => state.documents.documents
  );

  const handleAnalyze = async () => {
    /*
    To consider:
    Improve handleAnalyze() Base64 Handling (Optional)
If attachment.data is already base64 (FHIR standard usually is), you’re good. But for robustness, especially if attachment.url is sometimes used instead of data, you might want to detect and fetch content if needed.
      const textContent = doc.resource?.content?.[0]?.attachment?.data;

if (!textContent && doc.resource?.content?.[0]?.attachment?.url) {
  // Optionally fetch and base64-encode the content from URL
}
✅ 4. [Security] Consider Limiting Document Size
You may want to add a limit (e.g., <10MB per document) to avoid users overloading the backend.

ts
Copy
Edit
const MAX_DOC_SIZE_MB = 10;

const isTooLarge = (base64: string) =>
  (base64.length * 3) / 4 / 1024 / 1024 > MAX_DOC_SIZE_MB;

if (documents.some((doc) => isTooLarge(doc.base64_content))) {
  return res.status(413).json({ message: "Document too large" });
}
✅ 5. [Optional] Add UUID or Metadata Per Document
To help with tracking:

ts
Copy
Edit
return {
  id: doc.id || uuidv4(), // Add uuid if needed
  content_type: contentType,
  base64_content: textContent,
};
You can npm install uuid for this.
*/
    try {
      console.log("documents", documents);

      const documentsToSend = documents.map((doc) => {
        const attachment = doc.content?.[0]?.attachment;

        const textContent = attachment?.data; // base64 content
        const contentType = attachment?.contentType || "text/plain";

        console.log("textContent", textContent);
        console.log("contentType", contentType);

        return {
          content_type: contentType,
          base64_content: textContent,
        };
      });

      // Filter out documents that are missing data
      const validDocs = documentsToSend.filter(
        (doc) => doc.base64_content && doc.content_type
      );

      if (validDocs.length === 0) {
        console.warn("No valid documents to send.");
        return;
      }

      const response = await axios.post("/api/analyzeDocument", {
        documents: validDocs,
      });

      console.log("Analysis result:", response.data);
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
