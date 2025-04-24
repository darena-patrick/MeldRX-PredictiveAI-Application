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
          documents: "DocumentReference?patient={{context.patientId}}",
          allergies: "AllergyIntolerance?patient={{context.patientId}}",
          carePlans: "CarePlan?patient={{context.patientId}}",
          careTeams: "CareTeam?patient={{context.patientId}}",
          devices: "Device?patient={{context.patientId}}",
          diagnosticReports: "DiagnosticReport?patient={{context.patientId}}",
          encounters: "Encounter?patient={{context.patientId}}",
          goals: "Goal?patient={{context.patientId}}",
          immunizations: "Immunization?patient={{context.patientId}}",
          locations: "Location?patient={{context.patientId}}",
          medicationStatements: "MedicationStatement?patient={{context.patientId}}",
          organizations: "Organization?_id={{context.patientId}}", // orgs often not tied to patient directly
          practitioners: "Practitioner?_id={{context.patientId}}",
          practitionerRoles: "PractitionerRole?practitioner={{context.patientId}}",
          provenance: "Provenance?target=Patient/{{context.patientId}}",
        },
      },
    ],
  });
}
