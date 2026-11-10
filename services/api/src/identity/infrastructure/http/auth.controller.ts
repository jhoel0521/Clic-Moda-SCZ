import { Public } from '@nestjs/authentication';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthenticateStaffCommand } from '../../application/dtos/authenticate-staff.command.js';
import { AuthenticateStaffUseCase } from '../../application/use-cases/authenticate-staff.use-case.js';
import { LoginThrottlerGuard } from './login-throttler.guard.js';
import {
  type LoginRequestDto,
  type LoginResponseDto,
  loginRequestSchema,
  toLoginResponse,
} from './login.dto.js';

// Adaptador de entrada HTTP: solo traduce petición y respuesta; la lógica está en el caso de uso.
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticateStaff: AuthenticateStaffUseCase) {}

  @Public() // el inicio de sesión no puede exigir sesión
  @UseGuards(LoginThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body({ schema: loginRequestSchema }) body: LoginRequestDto
  ): Promise<LoginResponseDto> {
    const result = await this.authenticateStaff.execute(
      new AuthenticateStaffCommand(body.email, body.password)
    );
    return toLoginResponse(result);
  }
}
