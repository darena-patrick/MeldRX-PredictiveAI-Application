"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "@/app/redux/store";
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
import { fetchAIResponse } from "@/utils/serverAPICalls";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";
import { fetchFHIRResource } from "@/utils/fhirAPICalls";
import { setAllergies } from "@/app/redux/patientDataSlicers/allergySlice";
import { setCareTeams } from "@/app/redux/patientDataSlicers/careTeamSlice";
import { setDevices } from "@/app/redux/patientDataSlicers/deviceSlice";
import { setDiagnosticReports } from "@/app/redux/patientDataSlicers/diagnosticReportSlice";
import { setEncounters } from "@/app/redux/patientDataSlicers/encounterSlice";
import { setGoals } from "@/app/redux/patientDataSlicers/goalSlice";
import { setImmunizations } from "@/app/redux/patientDataSlicers/immunizationSlice";
import { setMedicationStatements } from "@/app/redux/patientDataSlicers/medicationStatementSlice";
import { setProcedures } from "@/app/redux/patientDataSlicers/procedureSlice";
import { setProvenances } from "@/app/redux/patientDataSlicers/provenanceSlice";
import { setDocuments } from "@/app/redux/patientDataSlicers/documentSlice";
import { setObservations } from "@/app/redux/patientDataSlicers/observationsSlice";
import { setConditions } from "@/app/redux/patientDataSlicers/conditionSlice";
import { setCarePlans } from "@/app/redux/patientDataSlicers/carePlanSlice";

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
  const [aiLoading, setAiLoading] = useState(false);
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
  const [aiLoadingSections, setAiLoadingSections] = useState({
    risk: true,
    trends: true,
    recommendations: true,
    preventive: true,
    summary: true,
    accuracy: true,
  });

  const setSectionLoading = (
    section: keyof typeof aiLoadingSections,
    isLoading: boolean
  ) => {
    setAiLoadingSections((prev) => ({ ...prev, [section]: isLoading }));
  };

  useEffect(() => {
    if (!token || !patientId) return;

    (async () => {
      try {
        await Promise.all([
          fetchFHIRResource({
            resourceType: "Observation",
            token,
            patientId,
            dispatch,
            setResourceAction: setObservations,
            onFetched: fetchObservationAIInsights,
            maxItems: 6,
          }),

          fetchFHIRResource({
            resourceType: "DocumentReference",
            token,
            patientId,
            dispatch,
            setResourceAction: setDocuments,
            setLoading,
            setError,
          }),

          fetchFHIRResource({
            resourceType: "Condition",
            token,
            patientId,
            dispatch,
            setResourceAction: setConditions,
            setLoading,
            setError,
            onFetched: (conditions) =>
              fetchConditionAIInsights(conditions.slice(0, 6)),
            maxItems: 6,
          }),

          fetchFHIRResource({
            resourceType: "AllergyIntolerance",
            token,
            patientId,
            dispatch,
            setResourceAction: setAllergies,
          }),

          fetchFHIRResource({
            resourceType: "CareTeam",
            token,
            patientId,
            dispatch,
            setResourceAction: setCareTeams,
          }),

          fetchFHIRResource({
            resourceType: "CarePlan",
            token,
            patientId,
            dispatch,
            setResourceAction: setCarePlans,
          }),

          fetchFHIRResource({
            resourceType: "Device",
            token,
            patientId,
            dispatch,
            setResourceAction: setDevices,
          }),

          fetchFHIRResource({
            resourceType: "DiagnosticReport",
            token,
            patientId,
            dispatch,
            setResourceAction: setDiagnosticReports,
          }),

          fetchFHIRResource({
            resourceType: "Encounter",
            token,
            patientId,
            dispatch,
            setResourceAction: setEncounters,
          }),

          fetchFHIRResource({
            resourceType: "Goal",
            token,
            patientId,
            dispatch,
            setResourceAction: setGoals,
          }),

          fetchFHIRResource({
            resourceType: "Immunization",
            token,
            patientId,
            dispatch,
            setResourceAction: setImmunizations,
          }),

          fetchFHIRResource({
            resourceType: "MedicationStatement",
            token,
            patientId,
            dispatch,
            setResourceAction: setMedicationStatements,
          }),

          fetchFHIRResource({
            resourceType: "Procedure",
            token,
            patientId,
            dispatch,
            setResourceAction: setProcedures,
          }),

          fetchFHIRResource({
            resourceType: "Provenance",
            token,
            patientId,
            dispatch,
            setResourceAction: setProvenances,
          }),
        ]);
      } catch (err) {
        console.error("Error fetching FHIR resources:", err);
      }
    })();
  }, [token, patientId, dispatch]);

  const fetchConditionAIInsights = async (conditions: any[]) => {
    try {
      setAiLoading(true);
      const conditionNames = conditions.map(
        (c) => c.code?.coding?.[0]?.display || "Unknown"
      );

      const prompt = `
        Given the conditions: ${conditionNames.join(", ")}, 
        provide a raw response.
      `;

      const aiResponse = await fetchAIResponse(prompt);

      // console.log("Raw AI response (Condition):", aiResponse);
      setConditionInsights(aiResponse);

      return aiResponse;
    } catch (error) {
      console.error("Error fetching Condition AI insights:", error);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const fetchObservationAIInsights = async (observations: any[]) => {
    try {
      setAiLoading(true);
      const observationNames = observations.map((o) => {
        const categoryCode = o.category?.[0]?.coding?.[0]?.code || "Unknown";
        return categoryCode;
      });

      const prompt = `
        Given the observations: ${observationNames.join(", ")}, 
        provide a raw response.
      `;

      const aiResponse = await fetchAIResponse(prompt);

      // console.log("Raw AI response (Observation):", aiResponse);
      setObservationInsights(aiResponse);

      // Just return the raw AI response
      return aiResponse;
    } catch (error) {
      console.error("Error fetching Observation AI insights:", error);
      return null;
    } finally {
      setAiLoading(false);
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
    const maxRetries = 10;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const prompt = `
          Please respond ONLY with valid JSON in a single code block, like:
          \`\`\`json
          { "riskScore": 70, ... }
        
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
  
          Ensure the response is a valid JSON object and strictly follows the JSON structure.
          The fields "riskScore", "riskScoreExplanation", "recommendedTreatments", "conditionTrends", and "preventiveMeasures" must not be null.
          The "accuracy" value should be a number between 0 and 1, representing the model's confidence in the response.
          If any of the information is unavailable or uncertain, the model should provide a best estimate but should not return null for the above parameters.
        `;

        const aiResponse = await fetchAIResponse(prompt);

        // console.log("Final AI response (Combined):", aiResponse);

        if (aiResponse) {
          const extractJSON = (text: string): string | null => {
            const match =
              text.match(/```json\s*([\s\S]*?)\s*```/i) ||
              text.match(/{[\s\S]*}/);
            return match ? match[1] || match[0] : null;
          };

          const cleanedResponse = extractJSON(aiResponse);

          if (!cleanedResponse)
            throw new Error("No valid JSON found in AI response");

          const parsedResponse = JSON.parse(cleanedResponse);

          setRiskScore(parsedResponse.riskScore || 50);

          setRiskScoreExplanation(
            parsedResponse.riskScoreExplanation || "No explanation provided."
          );
          setSectionLoading("risk", false);
          setAccuracy(parsedResponse.accuracy || 0.5);
          setAccuracyExplanation(
            parsedResponse.accuracyExplanation || "No explanation provided."
          );
          setSectionLoading("accuracy", false);
          setRecommendations(parsedResponse.recommendedTreatments || []);
          setSectionLoading("recommendations", false);
          setNormalResponse(parsedResponse.normalResponse);
          setSectionLoading("summary", false);
          setPreventiveMeasures(parsedResponse.preventiveMeasures || []);
          setSectionLoading("preventive", false);
          setConditionTrends(parsedResponse.conditionTrends || []);
          setSectionLoading("trends", false);

          return parsedResponse;
        } else {
          return null;
        }
      } catch (error) {
        console.warn("Error combining AI insights:", error);
        attempt++;
        console.warn("Re-trying again automatically with count", attempt);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Waiting 500ms before retrying to avoid spamming AI model
        } else {
          console.error("Max retry attempts reached. Returning null.");
          return null;
        }
      }
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
      {error ? (
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

          {/* Risk Score */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Risk Score</h3>
            {aiLoadingSections.risk ? (
              <div className="flex items-center justify-center h-48">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : riskScore !== null ? (
              <>
                <p className="text-xl font-semibold mb-4">{riskScore}%</p>
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
              </>
            ) : (
              <p>No risk score available.</p>
            )}
          </div>

          {/* Condition Trends */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Condition Trends Over Time</h3>
            {aiLoadingSections.trends ? (
              <div className="flex items-center justify-center h-48">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : conditionTrends && conditionTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={conditionTrends.map((trend, index) => ({
                    date: `Date ${index + 1}`,
                    severity: trend.length % 100,
                  }))}
                >
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="severity" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No trends found.</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Recommended Actions</h3>
            {aiLoadingSections.recommendations ? (
              <div className="flex items-center justify-center h-24">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : recommendations && recommendations.length > 0 ? (
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
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Preventive Measures</h3>
            {aiLoadingSections.preventive ? (
              <div className="flex items-center justify-center h-24">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : preventiveMeasures && preventiveMeasures.length > 0 ? (
              <ul className="list-disc list-inside">
                {preventiveMeasures.map((measure, index) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>
            ) : (
              <p>No preventive measures available.</p>
            )}
          </div>

          {/* AI Summary */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Quick Summary</h3>
            {aiLoadingSections.summary ? (
              <div className="flex items-center justify-center h-24">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : normalResponse ? (
              <p className="text-sm">{normalResponse}</p>
            ) : (
              <p>No summary available.</p>
            )}
          </div>

          {/* AI Accuracy */}
          <div className="card bg-base-200 p-4 shadow-lg">
            <h3 className="text-lg font-bold">Overall AI Accuracy</h3>
            {aiLoadingSections.accuracy ? (
              <div className="flex items-center justify-center h-24">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : accuracy !== null && accuracy !== undefined ? (
              <>
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
                        <button className="btn btn-primary">
                          Download PDF
                        </button>
                      )
                    }
                  </PDFDownloadLink>
                </div>
              </>
            ) : (
              <p>No accuracy score available.</p>
            )}
          </div>
        </div>
      ) : loading ? (
        <p>Loading documents and conditions...</p>
      ) : (
        <p>No conditions found.</p>
      )}
    </div>
  );
}
