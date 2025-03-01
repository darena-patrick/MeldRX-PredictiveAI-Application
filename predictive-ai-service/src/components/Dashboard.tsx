"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { RootState } from "@/app/redux/store";
import { setConditions } from "@/app/redux/conditionSlice";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { fetchGeminiResponse } from "@/utils/serverAPICalls";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

const AIResponsePDF = ({ normalResponse }: { normalResponse: string }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>AI Response</Text>
      <Text style={styles.text}>{normalResponse}</Text>
    </Page>
  </Document>
);

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const patientId = useSelector((state: RootState) => state.auth.patientId);
  const conditions = useSelector(
    (state: RootState) => state.conditions.conditions
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState<number>(50);
  const [conditionTrends, setConditionTrends] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [normalResponse, setNormalResponse] = useState<string>("");

  useEffect(() => {
    if (!token || !patientId) return;

    const fetchConditions = async () => {
      try {
        let allConditions: any[] = [];
        let nextUrl = `https://app.meldrx.com/api/fhir/23cd739c-3141-4d1a-81a3-697b766ccb56/Condition?patient=${patientId}`;

        while (nextUrl) {
          const bundleResponse = await axios.get(nextUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const conditionResponses = await Promise.all(
            bundleResponse.data.entry.map((entry: any) =>
              axios.get(entry.fullUrl, {
                headers: { Authorization: `Bearer ${token}` },
              })
            )
          );

          allConditions = [
            ...allConditions,
            ...conditionResponses.map((res) => res.data),
          ];
          nextUrl =
            bundleResponse.data.link?.find(
              (link: any) => link.relation === "next"
            )?.url || null;
        }

        dispatch(setConditions(allConditions));
        setLoading(false);

        // Generate AI-driven insights
        fetchAIInsights(allConditions);
      } catch (error) {
        console.error("Error fetching conditions:", error);
        setError("Failed to fetch conditions.");
        setLoading(false);
      }
    };

    fetchConditions();
  }, [token, patientId, dispatch]);

  const fetchAIInsights = async (conditions: any[]) => {
    try {
      const conditionNames = conditions.map(
        (c) => c.code?.coding?.[0]?.display || "Unknown"
      );

      /*
          Given the condition: ${condition} and patient history: ${JSON.stringify(patientHistory)}, provide:
        - Risk prediction (likelihood of worsening)
        - Recommended treatments
        - Severity classification
        - Preventive measures`;
          const prompt = `Given the conditions: ${conditionNames.join(
        ", "
      )}, provide:
      - A risk prediction score (0-100).
      - Recommended treatments.
      - Condition severity trends over time.
      - Preventive measures.`;

      */
      const prompt = `
      Given the conditions: ${conditionNames.join(
        ", "
      )}, provide a structured response in the following JSON format:
  
      {
        "riskScore": [0-100 or null], // Risk prediction score (0-100) or null if not possible to estimate.
        "recommendedTreatments": [string] | null, // List of recommended treatments, or null if not possible to provide.
        "conditionTrends": [string] | null, // General trends of condition severity over time, or null if not possible to estimate.
        "preventiveMeasures": [string] | null, // List of preventive measures, or null if not possible to provide.
        "normalResponse": string // The raw AI model response
      }
  
      If any information is unavailable or uncertain, return null for that parameter. If the prediction or recommendations are not applicable, return null as well.
  
      Please ensure the response strictly follows the JSON structure, with keys as shown, even if some values are null. Be concise and to the point in your response.
  `;

      const aiResponse = await fetchGeminiResponse(prompt);

      console.log("aiResponse", aiResponse);

      if (aiResponse) {
        const cleanedResponse = aiResponse.replace(/```json|```/g, "").trim();

        const parsedResponse = JSON.parse(cleanedResponse);

        setRiskScore(parsedResponse.riskScore);
        setConditionTrends(parsedResponse.conditionTrends);
        setRecommendations(parsedResponse.recommendations);
        setNormalResponse(parsedResponse.normalResponse);
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    }
  };

  const clinicalStatusCounts = conditions.reduce((acc: any, condition: any) => {
    const status = condition.clinicalStatus?.coding?.[0]?.code || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(clinicalStatusCounts).map(([key, value]) => ({
    name: key,
    value,
  }));

  const barData = conditions.reduce((acc: any, condition: any) => {
    const code = condition.code?.coding?.[0]?.display || "Unknown";
    const existing = acc.find((item: any) => item.name === code);
    if (existing) existing.count += 1;
    else acc.push({ name: code, count: 1 });
    return acc;
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <p>Loading conditions...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : conditions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clinical Status Distribution */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Clinical Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Most Common Conditions */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Most Common Conditions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Score Gauge Chart */}
          {riskScore !== null && (
            <div className="card bg-base-200 p-4 shadow-lg">
              <h3 className="text-lg font-bold">Risk Score</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  barSize={10}
                  data={[{ value: riskScore }]}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    fill={
                      riskScore > 70
                        ? "red"
                        : riskScore > 40
                        ? "orange"
                        : "green"
                    }
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Condition Trends Chart */}
          {conditionTrends && conditionTrends.length > 0 && (
            <div className="card bg-base-200 p-4 shadow-lg">
              <h3 className="text-lg font-bold">Condition Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conditionTrends}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="severity" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Recommended Actions</h3>
            {recommendations && recommendations.length > 0 ? (
              <ul className="list-disc list-inside">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p>No recommendations available.</p>
            )}
          </div>

          {/* AI Recommendations */}
          {normalResponse && (
            <div className="card bg-base-200 p-4 shadow-lg">
              <h3 className="text-lg font-bold">AI Raw Response</h3>
              <p className="text-sm">{normalResponse}</p>
              <div className="mt-4">
                <PDFDownloadLink
                  document={<AIResponsePDF normalResponse={normalResponse} />}
                  fileName="AI_Response.pdf"
                >
                  {({ loading }) =>
                    loading ? (
                      <button className="btn btn-primary">
                        Generating PDF...
                      </button>
                    ) : (
                      <button className="btn btn-primary">Download PDF</button>
                    )
                  }
                </PDFDownloadLink>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>No conditions found.</p>
      )}
    </div>
  );
}
