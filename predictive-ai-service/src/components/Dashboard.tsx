"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { RootState } from "@/app/redux/store";
import { setConditions } from "@/app/redux/conditionSlice";
import { setObservations } from "@/app/redux/observationsSlice";
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
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";

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
  subheader: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 3,
  },
});

const AIResponsePDF = ({
  riskScore,
  riskScoreExplanation,
  recommendedTreatments,
  conditionTrends,
  preventiveMeasures,
  normalResponse,
  accuracy,
  accuracyExplanation,
}: {
  riskScore: number;
  riskScoreExplanation: string;
  recommendedTreatments: string[];
  conditionTrends: string[];
  preventiveMeasures: string[];
  normalResponse: string;
  accuracy: number;
  accuracyExplanation: string;
}) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>AI Response Summary</Text>

      {/* Risk Score */}
      <Text style={styles.subheader}>Risk Score: {riskScore}%</Text>
      <Text style={styles.text}>{riskScoreExplanation}</Text>

      {/* Overall AI Accuracy */}
      <Text style={styles.subheader}>
        Overall AI Accuracy: {(accuracy * 100).toFixed(2)}%
      </Text>
      <Text style={styles.text}>{accuracyExplanation}</Text>

      {/* Normal Response */}
      <Text style={styles.subheader}>Quick Summary:</Text>
      <Text style={styles.text}>{normalResponse}</Text>

      {/* Recommended Treatments */}
      {recommendedTreatments && recommendedTreatments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Recommended Treatments:</Text>
          <View style={styles.list}>
            {recommendedTreatments.map((treatment, index) => (
              <Text style={styles.listItem} key={index}>
                {treatment}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Condition Trends */}
      {conditionTrends && conditionTrends.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Condition Trends:</Text>
          <View style={styles.list}>
            {conditionTrends.map((trend, index) => (
              <Text style={styles.listItem} key={index}>
                {trend}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Preventive Measures */}
      {preventiveMeasures && preventiveMeasures.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subheader}>Preventive Measures:</Text>
          <View style={styles.list}>
            {preventiveMeasures.map((measure, index) => (
              <Text style={styles.listItem} key={index}>
                {measure}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Friendly Message */}
      <Text style={styles.text}>
        Predictions should be interpreted as supplementary insights, not
        absolute medical conclusions.
      </Text>
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
  const observations = useSelector(
    (state: RootState) => state.observations.observations
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState<number>(50);
  const [conditionTrends, setConditionTrends] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [preventiveMeasures, setPreventiveMeasures] = useState<string[]>([]);
  const [normalResponse, setNormalResponse] = useState<string>("");
  const [conditionInsights, setConditionInsights] = useState<string>("");
  const [observationInsights, setObservationInsights] = useState<string>("");
  const [accuracy, setAccuracy] = useState<number>();
  const [accuracyExplanation, setAccuracyExplanation] = useState<string>("");
  const [riskScoreExplanation, setRiskScoreExplanation] = useState<string>("");

  useEffect(() => {
    if (!token || !patientId) return;

    const fetchConditions = async () => {
      try {
        let allConditions: any[] = [];
        let nextUrl = `https://app.meldrx.com/api/fhir/${process.env.NEXT_PUBLIC_APP_ID}/Condition?patient=${patientId}`;

        while (nextUrl && allConditions.length < 6) {
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

          // Add conditions to the list, but stop after reaching 6
          allConditions = [
            ...allConditions,
            ...conditionResponses.map((res) => res.data),
          ];

          // If 6 conditions are fetched, break the loop
          if (allConditions.length >= 6) {
            break;
          }

          // Update the nextUrl for pagination
          nextUrl =
            bundleResponse.data.link?.find(
              (link: any) => link.relation === "next"
            )?.url || null;
        }

        dispatch(setConditions(allConditions));
        setLoading(false);

        // Pass the first 6 conditions to the AI function
        fetchConditionAIInsights(allConditions.slice(0, 6));
      } catch (error) {
        console.error("Error fetching conditions:", error);
        setError("Failed to fetch conditions.");
        setLoading(false);
      }
    };

    fetchConditions();
  }, [token, patientId, dispatch]);

  useEffect(() => {
    if (!token || !patientId) return;

    const fetchObservations = async () => {
      try {
        let allObservations: any[] = [];
        let nextUrl = `https://app.meldrx.com/api/fhir/${process.env.NEXT_PUBLIC_APP_ID}/Observation?patient=${patientId}`;

        while (nextUrl && allObservations.length < 6) {
          const response = await axios.get(nextUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Fetch individual observation entries
          const observationResponses = await Promise.all(
            response.data.entry.map((entry: any) =>
              axios.get(entry.fullUrl, {
                headers: { Authorization: `Bearer ${token}` },
              })
            )
          );

          // Add observations to the list, but stop after reaching 6
          allObservations = [
            ...allObservations,
            ...observationResponses.map((res) => res.data),
          ];

          // If 6 observations are fetched, break the loop
          if (allObservations.length >= 6) {
            break;
          }

          // Update the nextUrl for pagination
          nextUrl = response.data.link?.find(
            (link: any) => link.relation === "next"
          )?.url;
        }

        // Dispatch the observations to the store
        dispatch(setObservations(allObservations.slice(0, 6))); // Ensure only the first 6 are stored

        // Pass the first 6 observations to the AI function
        fetchObservationAIInsights(allObservations.slice(0, 6));
      } catch (error) {
        console.error("Error fetching observations:", error);
      }
    };

    fetchObservations();
  }, [token, patientId, dispatch]);

  const fetchConditionAIInsights = async (conditions: any[]) => {
    try {
      const conditionNames = conditions.map(
        (c) => c.code?.coding?.[0]?.display || "Unknown"
      );

      const prompt = `
        Given the conditions: ${conditionNames.join(", ")}, 
        provide a raw response.
      `;

      const aiResponse = await fetchGeminiResponse(prompt);

      // console.log("Raw AI response (Condition):", aiResponse);
      setConditionInsights(aiResponse);

      return aiResponse;
    } catch (error) {
      console.error("Error fetching Condition AI insights:", error);
      return null;
    }
  };

  const fetchObservationAIInsights = async (observations: any[]) => {
    try {
      const observationNames = observations.map((o) => {
        const categoryCode = o.category?.[0]?.coding?.[0]?.code || "Unknown";
        return categoryCode;
      });

      const prompt = `
        Given the observations: ${observationNames.join(", ")}, 
        provide a raw response.
      `;

      const aiResponse = await fetchGeminiResponse(prompt);

      // console.log("Raw AI response (Observation):", aiResponse);
      setObservationInsights(aiResponse);

      // Just return the raw AI response
      return aiResponse;
    } catch (error) {
      console.error("Error fetching Observation AI insights:", error);
      return null;
    }
  };

  useEffect(() => {
    // console.log("con", conditionInsights);
    // console.log("ob", observationInsights);
    if (!token || !patientId || !conditionInsights || !observationInsights)
      return;

    combineAndFormatAIInsights(conditionInsights, observationInsights);
  }, [conditionInsights, observationInsights]);

  const combineAndFormatAIInsights = async (
    conditions: string,
    observations: string
  ) => {
    try {
      const prompt = `
          Combine the following raw responses for conditions and observations:
  
          Condition response: ${conditions}
          Observation response: ${observations}
  
          Provide a structured JSON response in the following format:
  
          {
            "riskScore": [0-100], // Risk prediction score (0-100). It must not be null.
            "riskScoreExplanation": string, // Reason for the given risk score.
            "recommendedTreatments": [string], // List of recommended treatments. It must not be null.
            "conditionTrends": [string], // General trends of condition severity over time. It must not be null.
            "preventiveMeasures": [string], // List of preventive measures. It must not be null.
            "accuracy": [0-1], // A value between 0 and 1 representing the model's confidence in its response, where 1 is highly accurate.
            "accuracyExplanation": string, // Explanation for the given accuracy.
            "normalResponse": string // The raw AI model response.
          }
  
          Ensure the response strictly follows the JSON structure.
          The fields "riskScore", "riskScoreExplanation", "recommendedTreatments", "conditionTrends", and "preventiveMeasures" must not be null.
          The "accuracy" value should be a number between 0 and 1, representing the model's confidence in the response.
          If any of the information is unavailable or uncertain, the model should provide a best estimate but should not return null for the above parameters.
        `;

      const aiResponse = await fetchGeminiResponse(prompt);

      // console.log("Final AI response (Combined):", aiResponse);

      if (aiResponse) {
        const cleanedResponse = aiResponse.replace(/```json|```/g, "").trim();
        const parsedResponse = JSON.parse(cleanedResponse);

        setRiskScore(parsedResponse.riskScore || 50);
        setRiskScoreExplanation(
          parsedResponse.riskScoreExplanation || "No explanation provided."
        );
        setAccuracy(parsedResponse.accuracy || 0.5);
        setAccuracyExplanation(
          parsedResponse.accuracyExplanation || "No explanation provided."
        );
        setRecommendations(parsedResponse.recommendedTreatments || []);
        setNormalResponse(parsedResponse.normalResponse);
        setPreventiveMeasures(parsedResponse.preventiveMeasures || []);
        setConditionTrends(parsedResponse.conditionTrends || []);

        return parsedResponse;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error combining AI insights:", error);
      return null;
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
              <p className="text-xl font-semibold mb-4">{riskScore}%</p>{" "}
              {/* Display risk score above the gauge */}
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
              <p className="text-sm">{riskScoreExplanation}</p>
            </div>
          )}

          {/* Condition Trends Chart */}
          {conditionTrends && conditionTrends.length > 0 && (
            <div className="card bg-base-200 p-4 shadow-lg">
              <h3 className="text-lg font-bold">Condition Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={conditionTrends.map((trend, index) => ({
                    date: `Date ${index + 1}`, // Simulating dates for now
                    severity: trend.length % 100, // Using string length as a mock severity score
                  }))}
                >
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

          {/* Preventive Measures */}
          {preventiveMeasures && preventiveMeasures.length > 0 && (
            <div className="card bg-base-200 p-4 shadow-lg">
              <h3 className="text-lg font-bold">Preventive Measures</h3>
              <ul className="list-disc list-inside">
                {preventiveMeasures.map((measure, index) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Raw Response */}
          {normalResponse && (
            <div className="card bg-base-200 p-4 shadow-lg">
              <h3 className="text-lg font-bold">Quick Summary</h3>
              <p className="text-sm">{normalResponse}</p>
            </div>
          )}

          {/* Overall AI Accuracy */}
          {accuracy !== null && accuracy !== undefined && (
            <div className="card bg-base-200 p-4 shadow-lg">
              <h3 className="text-lg font-bold">Overall AI Accuracy</h3>
              <p className="text-xl">{(accuracy * 100).toFixed(2)}%</p>
              <p className="text-sm">{accuracyExplanation}</p>
              <div className="mt-4">
                <PDFDownloadLink
                  document={
                    <AIResponsePDF
                      riskScore={riskScore}
                      riskScoreExplanation={riskScoreExplanation}
                      recommendedTreatments={recommendations}
                      conditionTrends={conditionTrends}
                      preventiveMeasures={preventiveMeasures}
                      normalResponse={normalResponse}
                      accuracy={accuracy}
                      accuracyExplanation={accuracyExplanation}
                    />
                  }
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
