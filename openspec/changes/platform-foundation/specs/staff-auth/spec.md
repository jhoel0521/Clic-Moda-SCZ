# Spec Delta

## Purpose

Define cómo el personal de la tienda (Gerente, Despacho y Atención al Cliente) inicia sesión y cómo la API restringe sus rutas según el rol, para que ninguna operación de administración quede abierta al público.

## ADDED Requirements

### Requirement: Staff can sign in with email and password
The system SHALL authenticate a staff member with email and password and return a session token on success. The token MUST identify the user and their role and MUST expire after 8 hours.

#### Scenario: Valid credentials
- **WHEN** a staff member submits a correct email and password
- **THEN** the system returns a session token that carries the user's role and an expiry of 8 hours

#### Scenario: Wrong password or unknown email
- **WHEN** someone submits an unknown email or a wrong password
- **THEN** the system refuses with the same generic message in both cases and returns no token

### Requirement: Failed sign-ins are rate limited
The system MUST temporarily block sign-in attempts for an account after 5 consecutive failures within 15 minutes. A blocked attempt SHALL be refused even when the password is correct.

#### Scenario: Too many failures
- **WHEN** 5 consecutive sign-in attempts for the same email fail within 15 minutes
- **THEN** further attempts for that email are refused as too many requests until the block expires

#### Scenario: Success resets the counter
- **WHEN** a staff member signs in correctly before reaching 5 failures
- **THEN** the failure counter for that account resets to zero

### Requirement: Roles restrict API routes
The system SHALL accept a protected route only when the request carries a valid token whose role is allowed for that route. A request without a valid token MUST be answered as unauthenticated, and a request with an insufficient role as forbidden.

#### Scenario: No token
- **WHEN** a request to a protected route carries no token or an expired one
- **THEN** the system answers that authentication is required and performs no action

#### Scenario: Insufficient role
- **WHEN** a user with the Atención al Cliente role calls a route reserved for the Gerente
- **THEN** the system answers forbidden and performs no action

#### Scenario: Allowed role
- **WHEN** a user whose role is allowed for the route calls it with a valid token
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
