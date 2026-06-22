"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { RequiredDocumentFormDialog } from "./required-document-form-dialog";
import { RequiredDocumentsTable } from "./required-documents-table";
import {
  useCreateRequiredDocument,
  useDeleteRequiredDocument,
  useRequiredDocuments,
  useUpdateRequiredDocument,
} from "../queries/use-required-documents";
import type { RequiredDocumentFormValues } from "../schemas/required-document-schema";
import type { RequiredDocument, RequiredDocumentWriteBody } from "../types";

type FormState = { mode: "create" | "edit"; document: RequiredDocument | null };

export function RequiredDocumentsView({ organizationId }: { organizationId: string }) {
  const query = useRequiredDocuments(organizationId);
  const createMutation = useCreateRequiredDocument(organizationId);
  const updateMutation = useUpdateRequiredDocument(organizationId);
  const deleteMutation = useDeleteRequiredDocument(organizationId);
  const { toast } = useToast();

  const [formState, setFormState] = useState<FormState | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<RequiredDocument | null>(null);

  const documents = query.data?.data ?? [];
  const isSavingForm = createMutation.isPending || updateMutation.isPending;

  // Stable across unrelated re-renders (e.g. background refetch) so the open
  // form is not reset while the operator is typing.
  const formInitialValues = useMemo<RequiredDocumentFormValues | undefined>(
    () =>
      formState?.document
        ? { name: formState.document.name, observations: formState.document.observations ?? "" }
        : undefined,
    [formState],
  );

  function openCreate() {
    createMutation.reset();
    setFormState({ mode: "create", document: null });
  }

  function openEdit(document: RequiredDocument) {
    updateMutation.reset();
    setFormState({ mode: "edit", document });
  }

  function closeForm() {
    if (isSavingForm) return;
    setFormState(null);
  }

  function submitForm(values: RequiredDocumentFormValues) {
    const observations = values.observations.trim();
    const body: RequiredDocumentWriteBody = {
      name: values.name.trim(),
      observations: observations.length > 0 ? observations : null,
    };

    if (formState?.mode === "edit" && formState.document) {
      updateMutation.mutate(
        { documentId: formState.document.id, body },
        {
          onSuccess: () => {
            setFormState(null);
            toast({
              variant: "success",
              title: "Documento atualizado",
              description: `${body.name} foi atualizado com sucesso.`,
            });
          },
        },
      );
      return;
    }

    createMutation.mutate(body, {
      onSuccess: () => {
        setFormState(null);
        toast({
          variant: "success",
          title: "Documento cadastrado",
          description: `${body.name} foi adicionado à lista.`,
        });
      },
    });
  }

  function requestDelete(document: RequiredDocument) {
    deleteMutation.reset();
    setDocumentToDelete(document);
  }

  function cancelDelete() {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    setDocumentToDelete(null);
  }

  function confirmDelete() {
    if (!documentToDelete) return;
    const { id, name } = documentToDelete;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDocumentToDelete(null);
        toast({
          variant: "success",
          title: "Documento removido",
          description: `${name} foi removido da lista.`,
        });
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">
            Processo de associação
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">
            Documentos exigidos
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Configure os documentos que o paciente precisa enviar para se associar. As observações
            ajudam a orientar o envio de cada tipo de documento.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Icon name="plus" size={18} />
          Novo documento
        </Button>
      </section>

      <RequiredDocumentsTable
        documents={documents}
        isLoading={query.isLoading}
        error={query.error instanceof Error ? query.error : null}
        onEdit={openEdit}
        onDelete={requestDelete}
        onRetry={() => void query.refetch()}
      />

      <RequiredDocumentFormDialog
        open={formState !== null}
        mode={formState?.mode ?? "create"}
        initialValues={formInitialValues}
        pending={isSavingForm}
        onSubmit={submitForm}
        onCancel={closeForm}
      />

      <ConfirmDialog
        open={documentToDelete !== null}
        title="Remover documento exigido"
        description={
          documentToDelete ? (
            <>
              Tem certeza que deseja remover <strong>{documentToDelete.name}</strong> da lista de
              documentos exigidos? Esta ação não pode ser desfeita.
            </>
          ) : null
        }
        confirmLabel="Remover"
        confirmVariant="danger"
        pending={deleteMutation.isPending}
        pendingLabel="Removendo..."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
