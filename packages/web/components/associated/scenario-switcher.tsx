"use client";

import { Icon } from "@/components/ui/icon";
import { useScenario } from "./scenario-context";

// Seletor de cenários (mock) para pré-visualizar as variações da home —
// responsável por si, por dependentes, por pet, etc. Fica no topo da tela.
export function ScenarioSwitcher() {
  const { scenarioId, scenarios, setScenario } = useScenario();

  return (
    <label
      className="relative hidden items-center sm:inline-flex"
      title="Pré-visualizar cenário (dados mock)"
    >
      <span className="sr-only">Cenário de demonstração</span>
      <span className="pointer-events-none absolute left-3 text-[var(--text-tertiary)]">
        <Icon name="users" size={16} />
      </span>
      <select
        value={scenarioId}
        onChange={(event) => setScenario(event.target.value)}
        className="h-10 max-w-[230px] appearance-none truncate rounded-md border border-border bg-card pl-9 pr-8 text-sm font-semibold text-[var(--text-primary)] shadow-xs transition hover:border-primary-border focus-visible:ring-0"
      >
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[var(--text-tertiary)]">
        <Icon name="chevron-down" size={16} />
      </span>
    </label>
  );
}
