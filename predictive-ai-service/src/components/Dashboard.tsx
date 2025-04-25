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
  const [docLoading, setDocLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndReturnDocument = async (doc: DocumentReference) => {
    setDocLoading(true);
    setError(null);
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
      return { content, contentType };
    } catch (err: any) {
      throw new Error(`Error fetching document: ${err.message}`);
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
      setStatus(`Analyzing condition ${index + 1} of ${conditions.length}`);
      const prompt = `Given the condition: ${JSON.stringify(
        condition
      )}, provide a structured AI analysis.`;
      try {
        const res = await retryFetch(prompt);
        setResults((prev) => [
          ...prev,
          { type: "condition", index, result: res },
        ]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { type: "condition", index, error: String(err) },
        ]);
      }
      updateProgress();
    }

    for (const [index, observation] of observations.entries()) {
      setStatus(`Analyzing observation ${index + 1} of ${observations.length}`);
      const prompt = `Given the observation: ${JSON.stringify(
        observation
      )}, provide a structured AI analysis.`;
      try {
        const res = await retryFetch(prompt);
        setResults((prev) => [
          ...prev,
          { type: "observation", index, result: res },
        ]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { type: "observation", index, error: String(err) },
        ]);
      }
      updateProgress();
    }

    for (const [index, doc] of documentReferences.entries()) {
      setStatus(
        `Fetching and analyzing document ${index + 1} of ${
          documentReferences.length
        }`
      );
      try {
        const { content, contentType } = await fetchAndReturnDocument(doc);
        const prompt = `Analyze the following document content with type ${contentType}:\n${content}`;
        const res = await retryFetch(prompt);
        setResults((prev) => [
          ...prev,
          { type: "document", index, result: res },
        ]);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          { type: "document", index, error: String(err) },
        ]);
      }
      updateProgress();
    }
  };

  useEffect(() => {
    if (totalCount > 0) {
      analyzeData();
    }
  }, [totalCount]);

  return (
    <div className="p-4 max-h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4">
        <Progress value={progress} className="h-4" />
        <p className="mt-2 text-sm text-gray-600">{status}</p>
      </div>
      {results.map((entry, i) => (
        <Card key={i} className="mb-4">
          <CardContent>
            <h2 className="font-semibold text-md mb-1">{`${
              entry.type.charAt(0).toUpperCase() + entry.type.slice(1)
            } ${entry.index + 1}`}</h2>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(entry.result || entry.error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ))}
      {docLoading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
