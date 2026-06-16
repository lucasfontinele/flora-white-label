"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RegistrationSchema } from "../schemas/registration-schema";

type RegistrationDraft = Partial<RegistrationSchema>;

type RegistrationDraftStore = {
  draft: RegistrationDraft;
  hasHydrated: boolean;
  step: number;
  clearDraft: () => void;
  patchDraft: (draft: RegistrationDraft) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setStep: (step: number) => void;
};

export const useRegistrationDraftStore = create<RegistrationDraftStore>()(
  persist(
    (set) => ({
      draft: {},
      hasHydrated: false,
      step: 0,
      clearDraft: () => set({ draft: {}, step: 0 }),
      patchDraft: (draft) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...draft,
          },
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setStep: (step) => set({ step }),
    }),
    {
      name: "flora-registration-draft",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        draft: state.draft,
        step: state.step,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
