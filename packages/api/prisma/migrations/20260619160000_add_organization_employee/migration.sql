-- Organization employee: a person who works for an organization and will later
-- access the association's control panel. Linked 1:1 to a User (auth) and to the
-- Organization. The CPF (document) is unique per organization.

CREATE TABLE "organizations_employees" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_employees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_employees_userId_key" ON "organizations_employees"("userId");

CREATE UNIQUE INDEX "organizations_employees_organizationId_document_key" ON "organizations_employees"("organizationId", "document");

ALTER TABLE "organizations_employees" ADD CONSTRAINT "organizations_employees_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "organizations_employees" ADD CONSTRAINT "organizations_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
