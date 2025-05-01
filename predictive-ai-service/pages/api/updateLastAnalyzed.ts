import { NextApiRequest, NextApiResponse } from "next";

const FHIR_BASE = `https://app.meldrx.com/api/fhir/${process.env.NEXT_PUBLIC_APP_ID}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { patientId, date, token } = req.body;

  if (
    typeof patientId !== "string" ||
    typeof date !== "string" ||
    typeof token !== "string"
  ) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  try {
    const observation = {
      resourceType: "Observation",
      status: "final",
      code: {
        coding: [{
          system: "http://example.org/fhir/CodeSystem/analysis-status",
          code: "ai-last-analysis",
          display: "AI Last Analyzed"
        }]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: date,
      valueDateTime: date
    };

    const response = await fetch(`${FHIR_BASE}/Observation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(observation),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`FHIR error ${response.status}: ${text}`);
    }

    return res.status(200).json({ message: "Last analyzed recorded in FHIR" });
  } catch (error: any) {
    console.error("Failed to post observation:", error);
    return res.status(500).json({ message: "Error posting to FHIR", error: error.message });
  }
}
