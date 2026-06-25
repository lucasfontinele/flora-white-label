"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { PatientProfile } from "@/lib/data";

type PatientContextValue = {
  patients: PatientProfile[];
  selectedPatient: PatientProfile;
  selectedPatientId: string;
  selectPatient: (patientId: string) => void;
};

const PatientContext = createContext<PatientContextValue | null>(null);

// Patients come from the real auth session (mapped in the associated layout),
// so the list is stable for the session. A guardian sees their managed
// patients; a self-patient sees themselves.
export function PatientProvider({
  patients,
  defaultPatientId,
  children,
}: {
  patients: PatientProfile[];
  defaultPatientId: string;
  children: React.ReactNode;
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

  const value = useMemo<PatientContextValue>(
    () => ({
      patients,
      selectedPatient,
      selectedPatientId: selectedPatient?.id ?? "",
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
