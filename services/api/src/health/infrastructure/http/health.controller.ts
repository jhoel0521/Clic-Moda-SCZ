import { Public } from '@nestjs/authentication';
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator
  ) {}

  @Public() // el guard global de autenticación exige sesión en todo lo demás
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.database.pingCheck('database', { timeout: 1000 })]);
  }
}
