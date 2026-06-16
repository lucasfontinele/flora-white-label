import { ManagementList } from "@/components/domain/management-list";

const records = [
  { title: "Charlotte's Web", description: "Full spectrum · CBD 17%", meta: "3 terpenos", status: "Publicado", tone: "success" as const },
  { title: "ACDC", description: "Híbrida · CBD 14%", meta: "2 terpenos", status: "Publicado", tone: "success" as const },
  { title: "Cannatonic", description: "Híbrida · CBD 12%", meta: "2 terpenos", status: "Revisar", tone: "warning" as const },
  { title: "Ringo's Gift", description: "Full spectrum · CBD 20%", meta: "2 terpenos", status: "Publicado", tone: "success" as const },
];

export default function StrainsPage() {
  return (
    <ManagementList
      eyebrow="Catálogo educativo"
      heading="Strains"
      description="Mantenha dados informativos de THC, CBD, terpenos e tags educativas."
      action="Nova strain"
      icon="flask"
      records={records}
    />
  );
}
