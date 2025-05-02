import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });
  if (req.query.id !== "0001") return res.status(404).json({ message: "Service not found" });

  try {
    const { prefetch } = req.body;
    const patient = prefetch?.patient;
    const observationBundle = prefetch?.lastAnalysis;

    if (!patient || !patient.id) {
      return res.status(400).json({ message: "Invalid request: patient not provided in prefetch" });
    }

    const name = `${patient.name?.[0]?.given?.[0] || "Unknown"} ${patient.name?.[0]?.family || ""}`.trim();

    let lastAnalyzed = "";
    if (observationBundle?.entry?.length) {
      const obs = observationBundle.entry[0].resource;
      if (obs?.resourceType === "Observation" && obs?.valueDateTime) {
        lastAnalyzed = obs.valueDateTime;
      }
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
  } catch (err: any) {
    console.error("CDS hook processing error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
