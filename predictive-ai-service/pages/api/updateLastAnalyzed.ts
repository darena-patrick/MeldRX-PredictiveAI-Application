import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { patientId, date } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "") ?? req.body.token;

  if (typeof patientId !== "string" || typeof date !== "string" || !token) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  const observation = {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [
        {
          system: "http://example.org/fhir/CodeSystem/ai-analysis",
          code: "ai-last-analysis",
          display: "Last AI Analysis Date",
        },
      ],
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: date,
    valueDateTime: date,
  };

  try {
    const response = await fetch(
      `https://app.meldrx.com/api/fhir/${process.env.NEXT_PUBLIC_APP_ID}/Observation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(observation),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("FHIR write failed:", response.status, text);
      return res.status(500).json({ message: "Failed to write observation to FHIR" });
    }

    return res.status(200).json({ message: "Analysis date saved to FHIR" });
  } catch (err: any) {
    console.error("Unexpected error writing to FHIR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
