import type { LoginResponse } from "../../application/use-cases/AuthenticateUserUseCase.js";
import type { MeResponse } from "../../application/use-cases/GetMeUseCase.js";

export class AuthPresenter {
  static meToHttp(output: MeResponse): MeResponse {
    return AuthPresenter.contextToHttp(output) as MeResponse;
  }

  private static contextToHttp(output: MeResponse): MeResponse {
    return {
      user: {
        id: output.user.id,
        email: output.user.email,
        profile: output.user.profile,
        organizationId: output.user.organizationId,
        patientId: output.user.patientId,
        ...(output.user.guardianId ? { guardianId: output.user.guardianId } : {}),
        ...(output.user.organizationEmployeeId
          ? { organizationEmployeeId: output.user.organizationEmployeeId }
          : {}),
      },
      context: {
        view: output.context.view,
        organizationId: output.context.organizationId,
        patientId: output.context.patientId,
        ...(output.context.guardianId ? { guardianId: output.context.guardianId } : {}),
        ...(output.context.organizationEmployeeId
          ? { organizationEmployeeId: output.context.organizationEmployeeId }
          : {}),
        organization: output.context.organization,
        guardian: output.context.guardian,
        patient: output.context.patient,
        employee: output.context.employee,
        managedPatients: output.context.managedPatients,
      },
    };
  }

  static loginToHttp(output: LoginResponse): LoginResponse {
    return {
      accessToken: output.accessToken,
      ...AuthPresenter.contextToHttp(output),
    };
  }
}
