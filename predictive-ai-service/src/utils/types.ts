export type ResourceType =
  | "Condition"
  | "Observation"
  | "DocumentReference"
  | "AllergyIntolerance"
  | "CarePlan"
  | "CareTeam"
  | "Device"
  | "DiagnosticReport"
  | "Encounter"
  | "Goal"
  | "Immunization"
  | "MedicationStatement"
  | "Procedure"
  | "Provenance"

export type ResourceConfig = {
  maxItems?: number
  onFetched?: (items: any[]) => void
}

export type UseAllPatientDataOptions = {
  resourceConfigs?: Partial<Record<ResourceType, ResourceConfig>>
}