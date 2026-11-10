# Spec Delta

## Purpose

Define cómo el personal de la tienda (Gerente, Despacho y Atención al Cliente) inicia sesión y cómo la API restringe sus rutas según el rol, para que ninguna operación de administración quede abierta al público.

## ADDED Requirements

### Requirement: Staff can sign in with email and password
The system SHALL authenticate a staff member with email and password and return credentials that identify the user and their role. The credentials MUST stop being valid no later than 8 hours after sign-in.

#### Scenario: Valid credentials
- **WHEN** a staff member submits a correct email and password
- **THEN** the system returns credentials that carry the user's role and that expire within 8 hours

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

### Requirement: Roles restrict API routes
The system SHALL accept a protected route only when the request carries valid credentials whose role is allowed for that route. A request without valid credentials MUST be answered as unauthenticated, and a request with an insufficient role as forbidden.

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
