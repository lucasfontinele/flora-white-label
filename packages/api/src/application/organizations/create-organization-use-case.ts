import { ConflictException, ValidationException } from "../../exception/index.js";
import type { MasterUserContext } from "../../communication/http/plugins/master-auth.js";
import { organizationToResponse } from "../../domain/organizations/organization.js";
import { parseOrganizationRegistrationInput } from "../../domain/organizations/organization-registration.js";
import type { SubscriptionPlanRepository } from "../subscription-plans/subscription-plan-repository.js";
import type { OrganizationRepository } from "./organization-repository.js";

export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {}

  async execute(input: unknown, masterUser: MasterUserContext) {
    const parsed = parseOrganizationRegistrationInput(input);
    const subscriptionPlan = await this.subscriptionPlanRepository.findById(parsed.subscriptionPlanId);

    if (!subscriptionPlan) {
      throw new ValidationException("Plano selecionado inválido.");
    }

    const cnpjExists = await this.organizationRepository.existsByCnpj(parsed.company.cnpj);

    if (cnpjExists) {
      throw new ConflictException("Já existe uma organização cadastrada com este CNPJ.");
    }

    const organization = await this.organizationRepository.create({
      ...parsed,
      createdByMasterUserId: masterUser.id,
    });

    return organizationToResponse(organization);
  }
}
