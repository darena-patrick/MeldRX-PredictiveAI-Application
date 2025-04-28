"use client";

import React, { useState } from "react";
import { RootState } from "@/app/redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addAnalysis } from "@/app/redux/analysisSlice";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AnalysisPDF from "./AnalysisPDF";
import { useAIQueue } from "./hooks/useAIQueue";

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
  const [showModal, setShowModal] = useState(false);
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null);
  const [templatedQuestions, setTemplatedQuestions] = useState<string[]>([]);
  const [docContent, setDocContent] = useState<string | null>(null);
  const [docContentType, setDocContentType] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [docContentCache, setDocContentCache] = useState<
    Record<string, { content: string; contentType: string }>
  >({});
  const { analyzeItem } = useAIQueue();

  // const openModal = (url: string) => {
  //   setActiveDocUrl(url);
  //   setShowModal(true);
  // };

  const closeModal = () => {
    setShowModal(false);
    setActiveDocUrl(null);
  };

  const fetchAndShowDocument = async (doc: DocumentReference) => {
    setDocLoading(true);
    setError(null);
    setDocContent(null);
    setDocContentType(null);

    try {
      const attachment = doc.content?.[0]?.attachment;
      const isBase64Data = attachment?.data;
      const url = attachment?.url;

      const res = await fetch("/api/getDocumentContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isBase64Data
            ? { data: isBase64Data, contentType: attachment?.contentType }
            : { url }),
          token,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const { content, contentType } = await res.json();
      setDocContent(content);
      setDocContentType(contentType);
      setDocContentCache((prev) => ({
        ...prev,
        [doc.id]: { content, contentType },
      }));
      setShowContentModal(true);
    } catch (err: any) {
      setError(`Error fetching document: ${err.message}`);
    } finally {
      setDocLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed))
        throw new Error("Invalid format: JSON must be an array of strings");

      setTemplatedQuestions(parsed);
      alert("Templated questions loaded!");
    } catch (e) {
      alert("Failed to load questions: " + (e as Error).message);
    }
  };

  const handleAnalyze = async (doc: DocumentReference) => {
    setLoadingDocId(doc.id);
    setError(null);

    try {
      console.log("doc", doc);
      console.log("doc string", JSON.stringify(doc));
      console.log("token", token);

      const res = await analyzeItem(
        "DocumentReference",
        doc,
        (doc) => {
          const cached = docContentCache[doc.id];
          return `Analyze the following document content:\n\n${
            cached ? cached.content : JSON.stringify(doc)
          }\n\n${
            templatedQuestions.length > 0
              ? `Answer these questions: ${templatedQuestions.join(", ")}`
              : ""
          }`;
        },
        async (doc) => {
          const cached = docContentCache[doc.id];
          if (cached) {
            console.log("Using cached document content for analysis");
            return cached;
          }
          console.log("Fetching document content from server...");
          const fetchRes = await fetch("/api/getDocumentContent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ document: doc, token }),
          });

          if (!fetchRes.ok) {
            throw new Error(await fetchRes.text());
          }

          const { content, contentType } = await fetchRes.json();
          setDocContentCache((prev) => ({
            ...prev,
            [doc.id]: { content, contentType },
          }));
          return { content, contentType };
        }
      );

      console.log("Analysis result:", res);
      dispatch(addAnalysis({ documentId: doc.id, result: res }));
      setAnalysisResults((prev) => ({ ...prev, [doc.id]: res.analysis }));
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
    <div className="overflow-x-auto py-4 space-y-4">
      <div className="flex gap-4 items-center">
        <label className="btn btn-outline btn-sm">
          📥 Import Questions
          <input
            type="file"
            accept=".json"
            hidden
            onChange={handleFileUpload}
          />
        </label>
        {templatedQuestions.length > 0 && (
          <span className="text-success text-sm">
            ✓ {templatedQuestions.length} questions loaded
          </span>
        )}
      </div>

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
                {/* {isImage && attachment && (
                  <img
                    src={attachment.url}
                    alt="Medical image"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )} */}
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
                      className="btn btn-sm btn-outline"
                      onClick={() => fetchAndShowDocument(doc)}
                    >
                      View Content
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAnalyze(doc)}
                    >
                      Analyze
                    </button>
                  </div>
                )}

                {analysis && (
                  <>
                    <div className="bg-base-200 p-2 rounded text-sm text-left whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {analysis}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <PDFDownloadLink
                        document={<AnalysisPDF content={analysis} />}
                        fileName={`analysis-${doc.id}.pdf`}
                        className="btn btn-sm btn-outline"
                      >
                        Download PDF
                      </PDFDownloadLink>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && activeDocUrl && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-2">Original Document</h3>
            <div className="max-h-[70vh] overflow-y-auto">
              <iframe
                src={activeDocUrl}
                className="w-full h-[60vh] border rounded"
                title="Document Preview"
              />
            </div>
            <div className="modal-action">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {showContentModal && docContent && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-2">Document Content</h3>
            <div className="max-h-[70vh] overflow-y-auto">
              {/* If it's an image, render the image */}
              {docContent.startsWith("data:image/") ? (
                <img
                  src={docContent}
                  alt="Document Image"
                  className="w-full rounded"
                />
              ) : docContentType?.includes("xml") ? (
                // If it's XML, decode and parse it
                <div className="text-sm whitespace-pre-wrap bg-base-200 p-2 rounded">
                  {(() => {
                    try {
                      // If it was base64-encoded XML, decode it
                      const base64Match = docContent.match(
                        /^data:.*;base64,(.*)$/
                      );
                      const decoded = base64Match
                        ? atob(base64Match[1])
                        : docContent;

                      const parser = new DOMParser();
                      const xml = parser.parseFromString(
                        decoded,
                        "application/xml"
                      );

                      const paragraph = xml.querySelector("paragraph");
                      if (paragraph) {
                        return <p>{paragraph.textContent}</p>;
                      }

                      // Fallback to show raw decoded XML nicely
                      return <pre>{decoded}</pre>;
                    } catch (e) {
                      // Fallback if XML parsing fails
                      return <pre>{docContent}</pre>;
                    }
                  })()}
                </div>
              ) : (
                // Fallback for any other text
                <pre className="text-sm whitespace-pre-wrap bg-base-200 p-2 rounded">
                  {docContent}
                </pre>
              )}
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowContentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};
