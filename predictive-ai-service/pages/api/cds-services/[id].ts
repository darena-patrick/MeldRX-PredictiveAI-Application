import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (id === "0001") {
    try {
      const { prefetch } = req.body;
      if (!prefetch || !prefetch.patient) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const patient = prefetch.patient;
      const name = `${patient.name?.[0]?.given?.[0] || "Unknown"} ${patient.name?.[0]?.family || ""}`.trim();

      return res.json({
        cards: [
          {
            summary: `AI Insights for ${name}`,
            indicator: "info",
            source: {
              label: "AI Health Insights",
            },
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
  } else {
    return res.status(404).json({ message: "Service not found" });
  }
}
