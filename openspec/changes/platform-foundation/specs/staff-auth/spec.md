# Spec Delta

## Purpose

Define cómo el personal de la tienda (Gerente, Despacho y Atención al Cliente) inicia sesión y cómo la API restringe sus rutas según el rol, para que ninguna operación de administración quede abierta al público.

## ADDED Requirements

### Requirement: Staff can sign in with email and password
The system SHALL authenticate a staff member with email and password and return credentials that identify the user and all the roles they hold. The credentials MUST stop being valid no later than 8 hours after sign-in.

#### Scenario: Valid credentials
- **WHEN** a staff member submits a correct email and password
- **THEN** the system returns credentials that carry the user's roles and that expire within 8 hours

#### Scenario: Wrong password or unknown email
- **WHEN** someone submits an unknown email or a wrong password
- **THEN** the system refuses with the same generic message in both cases and returns no credentials

### Requirement: Sign-in attempts are rate limited per email
The system MUST refuse further sign-in attempts for an email after 5 attempts within 15 minutes, whatever their outcome, and the refusal SHALL apply even when the password is correct. Other emails MUST NOT be affected.

#### Scenario: Too many attempts
- **WHEN** a sixth sign-in attempt for the same email arrives within 15 minutes of the first
- **THEN** the system refuses it as too many requests, even with the correct password

#### Scenario: Other accounts unaffected
- **WHEN** an email has been blocked by the limit and a different email signs in correctly
- **THEN** the other email signs in normally

### Requirement: A user can hold several roles
The system SHALL allow a user to hold any number of roles at once (Gerente, Despacho, Atención al Cliente). A protected route MUST accept the user when at least one of their roles is allowed for that route.

#### Scenario: Several roles
- **WHEN** a user who holds both Despacho and Atención al Cliente calls a route reserved for Despacho
- **THEN** the system processes the request

#### Scenario: No role in common
- **WHEN** a user whose roles are all outside the allowed set calls a protected route
- **THEN** the system answers forbidden and performs no action

### Requirement: Roles restrict API routes
The system SHALL accept a protected route only when the request carries valid credentials whose roles include one allowed for that route. A request without valid credentials MUST be answered as unauthenticated, and a request without an allowed role as forbidden.

#### Scenario: No credentials
- **WHEN** a request to a protected route carries no credentials or expired ones
- **THEN** the system answers that authentication is required and performs no action

#### Scenario: Insufficient role
- **WHEN** a user with the Atención al Cliente role calls a route reserved for the Gerente
- **THEN** the system answers forbidden and performs no action

#### Scenario: Allowed role
- **WHEN** a user whose role is allowed for the route calls it with valid credentials
- **THEN** the system processes the request

### Requirement: Passwords are never stored in clear text
The system MUST store only a salted hash of each password and MUST NOT return or log a password or its hash in any response or log line.

#### Scenario: Stored credential
- **WHEN** a staff account is created
- **THEN** the stored credential is a salted hash that differs between two accounts with the same password

### Requirement: Initial manager account is created from configuration
The system SHALL create the first Gerente account from configured values on first setup, and MUST NOT ship with a default password in the repository.

#### Scenario: First setup
- **WHEN** the system is set up and no staff account exists
- **THEN** a Gerente account is created from the configured email and password

#### Scenario: Missing configuration
- **WHEN** the initial manager values are not configured
- **THEN** setup fails with an error that names the missing values and creates no account

### Requirement: Roles can be assigned from the command line
The system SHALL provide a command that an operator with access to the server runs without a package manager. It MUST let the operator search for a user, confirm the selected user, and choose the roles to assign through a multiple-selection form, and MUST change nothing until the operator confirms.

#### Scenario: Interactive assignment
- **WHEN** the operator runs the command, searches by part of a name or email, selects a user, confirms, and selects several roles
- **THEN** the user ends up holding exactly the selected roles

#### Scenario: Operator cancels
- **WHEN** the operator declines the confirmation
- **THEN** the system changes no roles and reports that nothing was changed

#### Scenario: Scripted use
- **WHEN** the operator passes the user's email and the list of roles as options together with an explicit confirmation option
- **THEN** the system assigns the roles without prompting

#### Scenario: No terminal and no options
- **WHEN** the command runs without an interactive terminal and without the options
- **THEN** it fails with a message that explains how to pass the options and changes nothing

### Requirement: Role changes are recorded
The system MUST record every role change with the user affected, the roles before and after, the time and the operating-system user who ran the command.

#### Scenario: Change recorded
- **WHEN** a role assignment is applied
- **THEN** a record with the user, the previous roles, the new roles, the time and the operator exists afterwards

### Requirement: At least one Gerente always remains
The system MUST refuse a role change that would leave no user with the Gerente role, and SHALL say so in its message.

#### Scenario: Removing the last Gerente
- **WHEN** an operator tries to remove the Gerente role from the only user who holds it
- **THEN** the system refuses, explains why and changes nothing
