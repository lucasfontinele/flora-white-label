// Shapes for the /organizations/:organizationId/required-documents endpoints.

export type RequiredDocument = {
  id: string;
  organizationId: string;
  name: string;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
};

// GET /organizations/:organizationId/required-documents
export type ListRequiredDocumentsResponse = {
  data: RequiredDocument[];
};

// Body for POST and PUT /organizations/:organizationId/required-documents[/:id]
export type RequiredDocumentWriteBody = {
  name: string;
  observations: string | null;
};
