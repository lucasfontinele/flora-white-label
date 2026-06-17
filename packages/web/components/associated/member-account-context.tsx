"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useScenario } from "./scenario-context";

// Front-end model for the logged-in Member (Responsável). A Responsável manages
// patients but is not necessarily a Patient — they may apply to become one.
// User → Member (Responsável) → Patient. State is mocked/persisted in localStorage.
export type PatientApplicationStatus = "none" | "pending" | "approved";

export type PatientApplicationDraft = {
  condition: string;
  prescriber?: string;
  hasPrescription: "sim" | "nao";
  notes?: string;
};

type MemberAccountValue = {
  responsibleName: string;
  applicationStatus: PatientApplicationStatus;
  isPatient: boolean;
  submitApplication: (draft: PatientApplicationDraft) => void;
};

const STATUS_KEY = "flora:patient-application";
const DRAFT_KEY = "flora:patient-application:draft";

const MemberAccountContext = createContext<MemberAccountValue | null>(null);

function isStatus(value: string | null): value is PatientApplicationStatus {
  return value === "none" || value === "pending" || value === "approved";
}

export function MemberAccountProvider({ children }: { children: React.ReactNode }) {
  const { scenario } = useScenario();
  const responsible = scenario.responsible;
  const [applicationStatus, setApplicationStatus] = useState<PatientApplicationStatus>("none");

  useEffect(() => {
    const stored = window.localStorage.getItem(STATUS_KEY);
    if (isStatus(stored)) setApplicationStatus(stored);
  }, []);

  // Persona "responsável por ele mesmo" já é paciente — sobrepõe a solicitação.
  const effectiveStatus: PatientApplicationStatus = responsible.isPatient ? "approved" : applicationStatus;

  const value = useMemo<MemberAccountValue>(
    () => ({
      responsibleName: responsible.name,
      applicationStatus: effectiveStatus,
      isPatient: effectiveStatus === "approved",
      submitApplication: (draft) => {
        setApplicationStatus("pending");
        window.localStorage.setItem(STATUS_KEY, "pending");
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      },
    }),
    [responsible.name, effectiveStatus],
  );

  return <MemberAccountContext.Provider value={value}>{children}</MemberAccountContext.Provider>;
}

export function useMemberAccount() {
  const context = useContext(MemberAccountContext);

  if (!context) {
    throw new Error("useMemberAccount must be used within MemberAccountProvider");
  }

  return context;
}
