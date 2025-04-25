import { DocumentReference } from "@/app/redux/patientDataSlicers/documentSlice";
import { RootState } from "@/app/redux/store";
import { fetchAIResponse } from "@/utils/serverAPICalls";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Progress } from "./ui/Progress";
import { Card, CardContent } from "./ui/CardContent";
import { Spinner } from "./ui/Spinner";
import { useAllPatientData } from "./hooks/useAllPatientData";

export default function Dashboard() {
  const token = useSelector((state: RootState) => state.auth.token);
  const { allResources, totalCount } = useAllPatientData();
  const { conditions, observations, documentReferences } = allResources;

  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const [docContent, setDocContent] = useState<string | null>(null);
  const [docContentType, setDocContentType] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState<boolean>(false);
  const [docLoading, setDocLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndShowDocument = async (doc: DocumentReference) => {
    setDocLoading(true);
    setError(null);
    setDocContent(null);
    setDocContentType(null);

    try {
      const res = await fetch("/api/getDocumentContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: doc, token }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const { content, contentType } = await res.json();
      setDocContent(content);
      setDocContentType(contentType);
      setShowContentModal(true);
    } catch (err: any) {
      setError(`Error fetching document: ${err.message}`);
    } finally {
      setDocLoading(false);
    }
  };

  const analyzeData = async () => {
    let completed = 0;

    const updateProgress = () => {
      completed++;
      setProgress(Math.round((completed / totalCount) * 100));
    };

    const retryFetch = async (prompt: string, retries = 2): Promise<any> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          return await fetchAIResponse(prompt);
        } catch (error) {
          if (attempt === retries) throw error;
        }
      }
    };

    for (const [index, condition] of conditions.entries()) {
      const prompt = `Please respond ONLY with valid JSON in a single code block, like:
\`\`\`json
{ "riskScore": 70, ... }
\`\`\`
\nCombine the following raw responses for conditions and observations:
\nCondition response: ${JSON.stringify(condition)}
Observation response: null
\nProvide a structured JSON response in the following format:
{ "riskScore": [0-100], "riskScoreExplanation": string, "recommendedTreatments": [string], "conditionTrends": [string], "preventiveMeasures": [string], "accuracy": [0-1], "accuracyExplanation": string, "normalResponse": string }`;

      setStatus(`Analyzing condition ${index + 1} of ${conditions.length}`);
      try {
        const res = await retryFetch(prompt);
        setResults((prev) => [...prev, res]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { error: `Condition ${index + 1} failed: ${err}` },
        ]);
      }
      updateProgress();
    }

    for (const [index, observation] of observations.entries()) {
      const prompt = `Please respond ONLY with valid JSON in a single code block, like:
\`\`\`json
{ "riskScore": 70, ... }
\`\`\`
\nCombine the following raw responses for conditions and observations:
\nCondition response: null
Observation response: ${JSON.stringify(observation)}
\nProvide a structured JSON response in the following format:
{ "riskScore": [0-100], "riskScoreExplanation": string, "recommendedTreatments": [string], "conditionTrends": [string], "preventiveMeasures": [string], "accuracy": [0-1], "accuracyExplanation": string, "normalResponse": string }`;

      setStatus(`Analyzing observation ${index + 1} of ${observations.length}`);
      try {
        const res = await retryFetch(prompt);
        setResults((prev) => [...prev, res]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { error: `Observation ${index + 1} failed: ${err}` },
        ]);
      }
      updateProgress();
    }

    for (const [index, doc] of documentReferences.entries()) {
      setStatus(
        `Fetching document ${index + 1} of ${documentReferences.length}`
      );
      try {
        await fetchAndShowDocument(doc);
        updateProgress();
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { error: `Document ${index + 1} failed: ${err}` },
        ]);
        updateProgress();
      }
    }
  };

  useEffect(() => {
    if (totalCount > 0) {
      analyzeData();
    }
  }, [totalCount]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4">
        <Progress value={progress} className="h-4" />
        <p className="mt-2 text-sm text-gray-600">{status}</p>
      </div>
      {results.map((result, i) => (
        <Card key={i} className="mb-4">
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ))}
      {docLoading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
      {showContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-2xl w-full overflow-auto">
            <h2 className="text-lg font-semibold mb-2">Document Content</h2>
            <pre className="text-sm whitespace-pre-wrap">{docContent}</pre>
            <button
              className="mt-4 btn btn-primary"
              onClick={() => setShowContentModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
