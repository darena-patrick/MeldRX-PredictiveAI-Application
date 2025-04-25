import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";

export const useAllPatientData = () => {
  const state = useSelector((state: RootState) => state);

  const {
    conditions,
    observations,
    documents,
    allergies,
    carePlans,
    careTeams,
    devices,
    diagnosticReports,
    encounters,
    goals,
    immunizations,
    medicationStatements,
    procedures,
    provenances,
  } = state;

  const allResources = {
    conditions: conditions.conditions,
    observations: observations.observations,
    documentReferences: documents.documents,
    allergies: allergies.allergies,
    carePlans: carePlans.carePlans,
    careTeams: careTeams.careTeams,
    devices: devices.devices,
    diagnosticReports: diagnosticReports.diagnosticReports,
    encounters: encounters.encounters,
    goals: goals.goals,
    immunizations: immunizations.immunizations,
    medicationStatements: medicationStatements.medicationStatements,
    procedures: procedures.procedures,
    provenances: provenances.provenances,
  };

  const totalCount = Object.values(allResources).reduce(
    (sum, list: any[]) => sum + (list?.length || 0),
    0
  );

  return { allResources, totalCount };
};
