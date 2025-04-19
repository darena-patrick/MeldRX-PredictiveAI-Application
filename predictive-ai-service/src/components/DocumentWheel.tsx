"use client";

import React, { useState } from "react";
import { RootState } from "@/app/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addAnalysis } from "@/app/redux/analysisSlice";

type DocumentReference = {
  id: string;
  type?: {
    text?: string;
  };
  date?: string;
  content?: Array<{
    attachment?: {
      data?: string;
      contentType?: string;
      url?: string;
    };
  }>;
};
export const DocumentWheel: React.FC = () => {
  const documents = useSelector(
    (state: RootState) => state.documents.documents
  );
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (doc: DocumentReference) => {
    setLoadingDocId(doc.id);
    setError(null);

    try {
      console.log("doc", doc);
      console.log("doc string", JSON.stringify(doc));
      console.log("token", token);

      const response = await fetch("/api/analyzeDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ document: doc, token }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error: ${text}`);
      }

      const result = await response.json();

      console.log("Analysis result:", result);

      dispatch(addAnalysis({ documentId: doc.id, result }));
      setAnalysisResults((prev) => ({ ...prev, [doc.id]: result.analysis }));
    } catch (err: any) {
      console.error("Failed to analyze document:", err);
      setError(`Failed: ${err.message}`);
    } finally {
      setLoadingDocId(null);
    }
  };

  if (!documents || documents.length === 0) {
    return <div className="text-center text-gray-500">No documents found.</div>;
  }

  return (
    <div className="overflow-x-auto py-4">
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="flex space-x-4">
        {documents.map((doc) => {
          const attachment = doc.content?.[0]?.attachment;
          const isImage =
            attachment?.contentType?.startsWith("image/") && attachment.url;
          const analysis = analysisResults[doc.id];

          return (
            <div
              key={doc.id}
              className="card w-80 bg-base-100 shadow-xl shrink-0"
            >
              <div className="card-body space-y-2">
                {isImage && attachment && (
                  <img
                    src={attachment.url}
                    alt="Medical image"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
                <h2 className="card-title">
                  {doc.type?.text || attachment?.contentType || "Unknown Type"}
                </h2>
                <p className="text-sm text-gray-500">
                  Date:{" "}
                  {doc.date ? new Date(doc.date).toLocaleDateString() : "N/A"}
                </p>

                {loadingDocId === doc.id ? (
                  <div className="flex justify-center my-2">
                    <span className="loading loading-spinner loading-sm text-primary"></span>
                  </div>
                ) : (
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAnalyze(doc)}
                    >
                      Analyze
                    </button>
                  </div>
                )}

                {analysis && (
                  <div className="bg-base-200 p-2 rounded text-sm text-left whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {analysis}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
