// Comando de entrada del caso de uso. Sin decoradores de transporte: el DTO HTTP se convierte a esto.
export class AuthenticateStaffCommand {
  constructor(
    readonly email: string,
    readonly password: string
  ) {}
}
