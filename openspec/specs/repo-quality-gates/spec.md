# repo-quality-gates Specification

## Purpose
Define las puertas de calidad que se ejecutan en cada commit sobre todos los subproyectos del monorepo (secretos, formato, lint, pruebas y build), para que ningún cambio roto o con secretos llegue al repositorio.

## Requirements

### Requirement: Commits with secrets are blocked
The system MUST reject a commit when any staged file contains a secret such as an access token or private key, and SHALL identify the file and the kind of secret.

#### Scenario: Staged secret
- **WHEN** a developer commits a file that contains an access token
- **THEN** the commit is rejected and the output names the file and the kind of secret

#### Scenario: Clean commit
- **WHEN** a developer commits files without secrets
- **THEN** the secrets check passes

### Requirement: Every subproject passes lint, tests and build before a commit
The system SHALL run lint, tests and build for each of `apps/shop`, `apps/admin` and `services/api` on every commit, and MUST reject the commit when any of them fails.

#### Scenario: Failure in one subproject
- **WHEN** a commit leaves any of the three subprojects with a lint error, a failing test or a failing build
- **THEN** the commit is rejected and the output names the failing subproject and step

#### Scenario: All green
- **WHEN** all three subprojects pass lint, tests and build
- **THEN** the commit is accepted

### Requirement: Functions are limited to 25 lines
The system MUST report as an error any function longer than 25 lines in `apps/shop`, `apps/admin` and `services/api`, ignoring blank lines and comments.

#### Scenario: Long function
- **WHEN** a function in a new subproject has 26 code lines
- **THEN** lint reports an error and the commit is rejected

#### Scenario: Function within the limit
- **WHEN** every function has 25 code lines or fewer
- **THEN** lint reports no error for this rule

### Requirement: The same gates run with one command
The system SHALL provide a single command at the repository root that runs the full set of quality gates on all subprojects, so that the same checks can run outside a commit.

#### Scenario: Run all gates on demand
- **WHEN** a developer runs the single root command
- **THEN** secrets, lint, tests and build run for every subproject and the command fails if any of them fails

### Requirement: API layer boundaries are enforced
The system MUST make lint fail when a file in a domain layer of `services/api` imports a framework, a persistence or HTTP library, or code from the application or infrastructure layers, and when a file in an application layer imports infrastructure code or a persistence or HTTP library. The error SHALL name the file and the forbidden import.

#### Scenario: Domain imports a framework
- **WHEN** a file under a domain folder imports a Nest package
- **THEN** lint reports an error naming the file and the import, and the commit is rejected

#### Scenario: Application imports infrastructure
- **WHEN** a file under an application folder imports code from an infrastructure folder or the TypeORM library
- **THEN** lint reports an error naming the file and the import, and the commit is rejected

#### Scenario: Allowed dependencies
- **WHEN** infrastructure code imports domain and application code, and application code imports domain code and the dependency-injection decorators of `@nestjs/common`
- **THEN** lint reports no boundary error
