"use client";

import { useEffect, useState } from "react";
import { UserManager } from "oidc-client-ts";
import { config } from "../../utils/auth";
import { useRouter } from "next/navigation";

const userManager = new UserManager(config);

export default function Launch() {
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function authenticateAndFetchData() {
      try {
        const params = new URLSearchParams(window.location.search);
        const extraQueryParams: Record<string, string> = {};

        params.forEach((value, key) => {
          extraQueryParams[key === "iss" ? "aud" : key] = value;
        });

        console.log("Extracted Query Params:", extraQueryParams);

        // Check for authentication response in URL (avoids infinite redirect loop)
        if (
          window.location.search.includes("code=") ||
          window.location.search.includes("error=")
        ) {
          console.log(
            "Detected authentication response, redirecting to /callback..."
          );
          router.push("/callback");
          return;
        }

        // Check if user is already authenticated
        let user = await userManager.getUser();

        if (!user || !user.access_token) {
          console.warn("User not authenticated, redirecting...");
          await userManager.signinRedirect({
            scope: "openid profile launch patient/*.*",
            extraQueryParams,
          });
          return;
        }

        console.log("Authenticated User:", user);

        // Fetch FHIR Patient Data
        const response = await fetch(
          `${extraQueryParams.aud}/Patient/${extraQueryParams.patient}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`FHIR request failed: ${response.statusText}`);
        }

        const data = await response.json();
        setPatientData(data);
        console.log("FHIR Patient Data:", data);
      } catch (err) {
        console.error("Error in Launch process:", err);
        setError((err as Error).message);
      }
    }

    authenticateAndFetchData();
  }, [router]);

  return (
    <div>
      <h1>Launching SMART App...</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {patientData && <pre>{JSON.stringify(patientData, null, 2)}</pre>}
    </div>
  );
}
