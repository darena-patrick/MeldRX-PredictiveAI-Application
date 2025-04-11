import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  return res.json({
    services: [
      {
        hook: "patient-view",
        title: "Predictive AI Service",
        description:
          "Provides AI-powered queue optimization, preventive care, and cost reduction analysis.",
        id: "0001",
        prefetch: {
          patient: "Patient/{{context.patientId}}",
          conditions: "Condition?patient={{context.patientId}}",
          observations: "Observation?patient={{context.patientId}}",
          medications: "MedicationRequest?patient={{context.patientId}}",
          procedures: "Procedure?patient={{context.patientId}}",
          claims: "Claim?patient={{context.patientId}}",
          documents: "DocumentReference?patient={{context.patientId}}"
        },
      },
    ],
  });
}
