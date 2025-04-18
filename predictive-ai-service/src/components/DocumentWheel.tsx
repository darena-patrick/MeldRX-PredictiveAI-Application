"use client";

import React from "react";
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

  const handleAnalyze = async (doc: DocumentReference) => {
    try {
      console.log("doc", doc);
      console.log("doc string", JSON.stringify(doc));

      const response = await fetch("/api/analyzeDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ document: doc, token }),
      });

      const result = await response.json();

      console.log("Analysis result:", result);

      dispatch(
        addAnalysis({
          documentId: doc.id,
          result,
        })
      );
    } catch (error) {
      console.error("Failed to analyze document:", error);
    }
  };

  if (!documents || documents.length === 0) {
    return <div className="text-center text-gray-500">No documents found.</div>;
  }

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex space-x-4">
        {documents.map((doc: DocumentReference, index: number) => {
          const attachment = doc.content?.[0]?.attachment;
          const isImage =
            attachment?.contentType?.startsWith("image/") && attachment.url;

          return (
            <div
              key={doc.id || index}
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
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAnalyze(doc)}
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
