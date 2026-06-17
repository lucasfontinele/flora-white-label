"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { associatedScenarios, type AssociatedScenario } from "@/lib/data";

// Cenário de demonstração ativo. Define qual responsável + pacientes alimentam a
// home e as demais telas do portal (mock; trocado pelo seletor do topo).
type ScenarioContextValue = {
  scenarioId: string;
  scenario: AssociatedScenario;
  scenarios: AssociatedScenario[];
  setScenario: (id: string) => void;
};

const DEFAULT_SCENARIO_ID = "padrao";
const STORAGE_KEY = "flora:scenario";

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO_ID);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && associatedScenarios.some((scenario) => scenario.id === stored)) {
      setScenarioId(stored);
    }
  }, []);

  const scenario = associatedScenarios.find((item) => item.id === scenarioId) ?? associatedScenarios[0];

  const value = useMemo<ScenarioContextValue>(
    () => ({
      scenarioId: scenario.id,
      scenario,
      scenarios: associatedScenarios,
      setScenario: (id) => {
        if (!associatedScenarios.some((item) => item.id === id)) return;
        setScenarioId(id);
        window.localStorage.setItem(STORAGE_KEY, id);
      },
    }),
    [scenario],
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const context = useContext(ScenarioContext);

  if (!context) {
    throw new Error("useScenario must be used within ScenarioProvider");
  }

  return context;
}
