"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { RootState } from "@/app/redux/store";
import { setConditions } from "@/app/redux/conditionSlice";

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

  useEffect(() => {
    if (!token || !patientId) return;

    const fetchConditions = async () => {
      try {
        let allConditions: any[] = [];
        let nextUrl = `https://app.meldrx.com/api/fhir/23cd739c-3141-4d1a-81a3-697b766ccb56/Condition?patient=${patientId}`;

        while (nextUrl) {
          const bundleResponse = await axios.get(nextUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const conditionUrls = bundleResponse.data.entry.map(
            (entry: any) => entry.fullUrl
          );

          const conditionRequests = conditionUrls.map((url: string) =>
            axios.get(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            })
          );

          const conditionResponses = await Promise.all(conditionRequests);

          const conditions = conditionResponses.map((res) => res.data);

          allConditions = [...allConditions, ...conditions];

          nextUrl =
            bundleResponse.data.link.find(
              (link: any) => link.relation === "next"
            )?.url || null;
        }

        dispatch(setConditions(allConditions));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conditions:", error);
        setError("Failed to fetch conditions.");
        setLoading(false);
      }
    };

    fetchConditions();
  }, [token, patientId, dispatch]);

  const renderClinicalStatus = (status: any) => {
    if (!status || !status.coding) return "Unknown";
    return status.coding.map((code: any) => code.display).join(", ");
  };

  const renderVerificationStatus = (status: any) => {
    if (!status || !status.coding) return "Unknown";
    return status.coding.map((code: any) => code.display).join(", ");
  };

  const renderCategory = (category: any) => {
    if (!category || !category.coding) return "Unknown";
    return category.coding.map((code: any) => code.display).join(", ");
  };

  return (
    <div>
      <h2>Welcome, {user?.name || "User"}</h2>
      {loading ? (
        <p>Loading conditions...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : conditions.length > 0 ? (
        <div>
          <h3>Conditions List</h3>
          <ul>
            {conditions.map((condition: any) => (
              <li key={condition.id}>
                <strong>Condition ID:</strong> {condition.id}
                <br />
                <strong>Clinical Status:</strong>{" "}
                {renderClinicalStatus(condition.clinicalStatus)}
                <br />
                <strong>Verification Status:</strong>{" "}
                {renderVerificationStatus(condition.verificationStatus)}
                <br />
                <strong>Category:</strong> {renderCategory(condition.category)}
                <br />
                <strong>Code:</strong>{" "}
                {condition.code?.coding?.[0]?.display || "Unknown"}
                <br />
                <strong>Onset Date:</strong>{" "}
                {condition.onsetDateTime || "Unknown"}
                <br />
                <strong>Recorded Date:</strong>{" "}
                {condition.recordedDate || "Unknown"}
                <br />
                {/* Display External URL if available */}
                {condition.code?.coding?.[0]?.system && (
                  <a
                    href={condition.code?.coding?.[0]?.system}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about this code
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No conditions found.</p>
      )}
    </div>
  );
}
