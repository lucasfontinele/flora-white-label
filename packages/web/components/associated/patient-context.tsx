"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { associatedPatients, associatedUser, type PatientProfile } from "@/lib/data";

type PatientContextValue = {
  patients: PatientProfile[];
  selectedPatient: PatientProfile;
  selectedPatientId: string;
  selectPatient: (patientId: string) => void;
};

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [selectedPatientId, setSelectedPatientId] = useState(associatedUser.activePatientId);

  useEffect(() => {
    const stored = window.localStorage.getItem("flora:selected-patient-id");
    if (stored && associatedPatients.some((patient) => patient.id === stored)) {
      setSelectedPatientId(stored);
    }
  }, []);

  const selectedPatient =
    associatedPatients.find((patient) => patient.id === selectedPatientId) ?? associatedPatients[0];

  const value = useMemo<PatientContextValue>(
    () => ({
      patients: associatedPatients,
      selectedPatient,
      selectedPatientId: selectedPatient.id,
      selectPatient: (patientId) => {
        if (!associatedPatients.some((patient) => patient.id === patientId)) return;
        setSelectedPatientId(patientId);
        window.localStorage.setItem("flora:selected-patient-id", patientId);
      },
    }),
    [selectedPatient],
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
