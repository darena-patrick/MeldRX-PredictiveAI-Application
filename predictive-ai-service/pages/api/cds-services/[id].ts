import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (id !== "0001") {
    return res.status(404).json({ message: "Service not found" });
  }

  try {
    const { prefetch, fhirServer, fhirAuthorization } = req.body;

    if (!fhirServer || !fhirAuthorization?.access_token) {
      return res.status(401).json({ message: "Unauthorized: missing access token or FHIR server URL" });
    }

    const patient = prefetch?.patientToGreet;
    if (!patient || !patient.id) {
      return res.status(400).json({ message: "Invalid request: missing patient data in prefetch" });
    }

    const patientId = patient.id;
    const name = `${patient.name?.[0]?.given?.[0] || "Unknown"} ${patient.name?.[0]?.family || ""}`.trim();

    const token = fhirAuthorization.access_token;
    const fhirBaseUrl = fhirServer;

    let lastAnalyzed = "";

    try {
      const response = await fetch(
        `${fhirBaseUrl}/Observation?subject=Patient/${patientId}&code=ai-last-analysis&_sort=-date&_count=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/fhir+json",
          },
        }
      );

      if (!response.ok) {
        console.warn("FHIR fetch failed with status:", response.status);
      } else {
        const json = await response.json();
        lastAnalyzed = json.entry?.[0]?.resource?.valueDateTime || "";
      }
    } catch (err) {
      console.error("Error fetching Observation from FHIR server:", err);
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
    console.error("Unhandled server error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
