"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PatientProfile } from "@/lib/data";
import { useScenario } from "./scenario-context";

type PatientContextValue = {
  patients: PatientProfile[];
  selectedPatient: PatientProfile;
  selectedPatientId: string;
  selectPatient: (patientId: string) => void;
};

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const { scenarioId, scenario } = useScenario();
  const patients = scenario.patients;

  const [selectedPatientId, setSelectedPatientId] = useState(scenario.responsible.activePatientId);

  // Ao trocar de cenário, volta para o paciente padrão da nova persona.
  useEffect(() => {
    setSelectedPatientId(scenario.responsible.activePatientId);
  }, [scenarioId, scenario.responsible.activePatientId]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

  const value = useMemo<PatientContextValue>(
    () => ({
      patients,
      selectedPatient,
      selectedPatientId: selectedPatient.id,
      selectPatient: (patientId) => {
        if (!patients.some((patient) => patient.id === patientId)) return;
        setSelectedPatientId(patientId);
      },
    }),
    [patients, selectedPatient],
  );

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatientSelection() {
  const context = useContext(PatientContext);

  if (!context) {
    throw new Error("usePatientSelection must be used within PatientProvider");
  }

  return context;
}
