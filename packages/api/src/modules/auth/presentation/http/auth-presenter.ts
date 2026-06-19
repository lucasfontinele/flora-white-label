import type { LoginResponse } from "../../application/use-cases/AuthenticateUserUseCase.js";

export class AuthPresenter {
  static loginToHttp(output: LoginResponse): LoginResponse {
    return {
      accessToken: output.accessToken,
      user: {
        id: output.user.id,
        email: output.user.email,
        profile: output.user.profile,
        organizationId: output.user.organizationId,
        guardianId: output.user.guardianId,
        patientId: output.user.patientId,
      },
      context: {
        view: output.context.view,
        organizationId: output.context.organizationId,
        guardianId: output.context.guardianId,
        patientId: output.context.patientId,
        guardian: output.context.guardian,
        patient: output.context.patient,
        managedPatients: output.context.managedPatients,
      },
    };
  }
}
