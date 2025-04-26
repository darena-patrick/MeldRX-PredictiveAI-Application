"use client";

import React, { useEffect } from "react";
import { useAllPatientData } from "./hooks/useAllPatientData";

const DebugData = () => {
  const { allResources, totalCount } = useAllPatientData();
  const {
    Condition = [],
    Observation = [],
    DocumentReference = [],
    AllergyIntolerance = [],
    CarePlan = [],
    CareTeam = [],
    Device = [],
    DiagnosticReport = [],
    Encounter = [],
    Goal = [],
    Immunization = [],
    MedicationStatement = [],
    Procedure = [],
    Provenance = [],
  } = allResources;

  useEffect(() => {
    console.log("All Resources:", allResources);
    console.log("Total Count:", totalCount);

    console.log("Condition:", Condition);
    console.log("Observation:", Observation);
    console.log("DocumentReference:", DocumentReference);
    console.log("AllergyIntolerance:", AllergyIntolerance);
    console.log("CarePlan:", CarePlan);
    console.log("CareTeam:", CareTeam);
    console.log("Device:", Device);
    console.log("DiagnosticReport:", DiagnosticReport);
    console.log("Encounter:", Encounter);
    console.log("Goal:", Goal);
    console.log("Immunization:", Immunization);
    console.log("MedicationStatement:", MedicationStatement);
    console.log("Procedure:", Procedure);
    console.log("Provenance:", Provenance);
  }, [allResources, totalCount]);

  return <div>DebugData</div>;
};

export default DebugData;
