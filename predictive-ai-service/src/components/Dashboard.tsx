import { DocumentReference } from "@/app/redux/patientDataSlicers/documentSlice";
import { RootState } from "@/app/redux/store";
import { fetchAIResponse } from "@/utils/serverAPICalls";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Progress } from "./ui/Progress";
import { Card, CardContent } from "./ui/CardContent";
import { Spinner } from "./ui/Spinner";
import { useAllPatientData } from "./hooks/useAllPatientData";

const PAGE_SIZE = 5;

export default function Dashboard() {
  const token = useSelector((state: RootState) => state.auth.token);
  const { allResources, totalCount } = useAllPatientData();
  const {
    Condition = [],
    Observation = [],
    DocumentReference = [],
    AllergyIntolerance = [],
    CarePlan = [],
    CareTeam = [],
    Device = [],
    DiagnosticReport = [],
    Encounter = [],
    Goal = [],
    Immunization = [],
    MedicationStatement = [],
    Procedure = [],
    Provenance = [],
  } = allResources;

  const [status, setStatus] = useState("");
  const [results, setResults] = useState<Record<string, any[]>>({});
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pages, setPages] = useState<Record<string, number>>({});
  const [isRunning, setIsRunning] = useState(true);
  const cancelRef = useRef(false);
  const [docLoading, setDocLoading] = useState(false);
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

      if (!res.ok) throw new Error(await res.text());
      const { content, contentType } = await res.json();
      return { content, contentType };
    } catch (err: any) {
      throw new Error(`Error fetching document: ${err.message}`);
    } finally {
      setDocLoading(false);
    }
  };

  const retryFetch = async (prompt: string, retries = 2): Promise<any> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fetchAIResponse(prompt);
      } catch (err) {
        if (attempt === retries) throw err;
      }
    }
  };

  const analyzeResource = async (
    type: string,
    items: any[],
    customPrompt?: (item: any) => string,
    fetchFn?: (item: any) => Promise<{ content: string; contentType: string }>
  ) => {
    const localResults: any[] = [];
    for (let index = 0; index < items.length; index++) {
      if (cancelRef.current) break;
      const item = items[index];
      setStatus(`Analyzing ${type} ${index + 1} of ${items.length}`);
      try {
        let prompt = customPrompt
          ? customPrompt(item)
          : `Analyze the following ${type}:\n${JSON.stringify(item)}`;

        if (fetchFn) {
          const { content, contentType } = await fetchFn(item);
          prompt = `Analyze the document (${contentType}):\n${content}`;
        }

        const res = await retryFetch(prompt);
        localResults.push({ index, result: res });
      } catch (err) {
        localResults.push({ index, error: String(err) });
      }

      setProgressMap((prev) => ({
        ...prev,
        [type]: Math.round(((index + 1) / items.length) * 100),
      }));
    }
    setResults((prev) => ({ ...prev, [type]: localResults }));
  };

  const analyzeData = async () => {
    cancelRef.current = false;
    setIsRunning(true);
    setStatus("Initializing...");

    const tasks: Promise<void>[] = [];

    const analyze = (
      type: string,
      items: any[],
      promptFn?: (item: any) => string,
      fetchFn?: (item: any) => Promise<any>
    ) => {
      setPages((p) => ({ ...p, [type]: 1 }));
      setExpanded((e) => ({ ...e, [type]: true }));
      tasks.push(analyzeResource(type, items, promptFn, fetchFn));
    };

    analyze("Condition", Condition);
    analyze("Observation", Observation);
    analyze(
      "DocumentReference",
      DocumentReference,
      undefined,
      fetchAndReturnDocument
    );
    analyze("AllergyIntolerance", AllergyIntolerance);
    analyze("CarePlan", CarePlan);
    analyze("CareTeam", CareTeam);
    analyze("Device", Device);
    analyze("DiagnosticReport", DiagnosticReport);
    analyze("Encounter", Encounter);
    analyze("Goal", Goal);
    analyze("Immunization", Immunization);
    analyze("MedicationStatement", MedicationStatement);
    analyze("Procedure", Procedure);
    analyze("Provenance", Provenance);

    await Promise.all(tasks);
    setStatus("Analysis completed.");
    setIsRunning(false);
  };

  useEffect(() => {
    if (totalCount > 0) analyzeData();
  }, [totalCount]);

  const toggleExpand = (type: string) =>
    setExpanded((prev) => ({ ...prev, [type]: !prev[type] }));

  const nextPage = (type: string) =>
    setPages((prev) => ({ ...prev, [type]: (prev[type] || 1) + 1 }));

  const prevPage = (type: string) =>
    setPages((prev) => ({
      ...prev,
      [type]: Math.max(1, (prev[type] || 1) - 1),
    }));

  const cancelAnalysis = () => {
    cancelRef.current = true;
    setStatus("Analysis cancelled.");
    setIsRunning(false);
  };

  return (
    <div className="p-4 max-h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">{status}</p>
        {isRunning && (
          <button className="btn btn-error text-white" onClick={cancelAnalysis}>
            Cancel
          </button>
        )}
      </div>

      {Object.entries(results).map(([type, entries]) => {
        const page = pages[type] || 1;
        const start = (page - 1) * PAGE_SIZE;
        const currentPageEntries = entries.slice(start, start + PAGE_SIZE);

        return (
          <div key={type} className="mb-4 border rounded p-3 shadow">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(type)}
            >
              <h2 className="text-lg font-semibold">{type}</h2>
              <Progress value={progressMap[type] || 0} className="w-1/2 h-2" />
            </div>

            {expanded[type] && (
              <>
                {currentPageEntries.map((entry, i) => (
                  <Card key={i} className="my-2">
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm">
                        {entry.result
                          ? JSON.stringify(entry.result, null, 2)
                          : `❌ ${entry.error}`}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => prevPage(type)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => nextPage(type)}
                    disabled={page * PAGE_SIZE >= entries.length}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      {docLoading && <Spinner />}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
