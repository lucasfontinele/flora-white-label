"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { associatedUser } from "@/lib/data";

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
  const [applicationStatus, setApplicationStatus] = useState<PatientApplicationStatus>("none");

  useEffect(() => {
    const stored = window.localStorage.getItem(STATUS_KEY);
    if (isStatus(stored)) setApplicationStatus(stored);
  }, []);

  const value = useMemo<MemberAccountValue>(
    () => ({
      responsibleName: associatedUser.name,
      applicationStatus,
      isPatient: applicationStatus === "approved",
      submitApplication: (draft) => {
        setApplicationStatus("pending");
        window.localStorage.setItem(STATUS_KEY, "pending");
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      },
    }),
    [applicationStatus],
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
