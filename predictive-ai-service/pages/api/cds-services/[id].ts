import { NextApiRequest, NextApiResponse } from "next";

export const patientAnalysisDates: { [patientId: string]: string } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (id !== "0001") {
    return res.status(404).json({ message: "Service not found" });
  }

  try {
    const { prefetch, fhirAuthorization } = req.body;
    if (!prefetch?.patient) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const patient = prefetch.patient;
    const patientId = patient.id;
    const name = `${patient.name?.[0]?.given?.[0] || "Unknown"} ${patient.name?.[0]?.family || ""}`.trim();

    const token = fhirAuthorization?.access_token;

    const apiId = process.env.NEXT_PUBLIC_APP_ID;
    if (!apiId) {
      console.error("API ID is not defined in environment variables.");
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!patientId) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    if (!token) {
      console.warn("Missing access token from fhirAuthorization (CDS Hooks context).");
      return res.status(401).json({ message: "Unauthorized" });
    }

    let lastAnalyzed = "";

    try {
      const response = await fetch(
        `https://app.meldrx.com/api/fhir/${apiId}/Observation?subject=Patient/${patientId}&code=ai-last-analysis&_sort=-date&_count=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/fhir+json",
          },
        }
      );

      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          const data = JSON.parse(text);
          lastAnalyzed = data.entry?.[0]?.resource?.valueDateTime || "";
        }
      } else {
        console.warn(`FHIR fetch failed with status ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching last analyzed date from FHIR:", err);
    }

    const analysisStatus = lastAnalyzed
      ? `Last analyzed on ${lastAnalyzed}`
      : "Patient not yet analyzed";

    return res.json({
      cards: [
        {
          summary: `AI Insights for ${name} - ${analysisStatus}`,
          indicator: lastAnalyzed ? "info" : "warning",
          source: { label: "AI Health Insights" },
          links: [
            {
              label: "Get AI Insights",
              url: "https://meld-rx-predictive-ai-application.vercel.app/launch",
              type: "smart",
            },
          ],
        },
      ],
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
