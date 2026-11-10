# Spec Delta

## Purpose

Define cómo la configuración de la tienda llega a los visitantes: lectura pública cacheada, aplicación sin parpadeos, valores por defecto ante fallos e invalidación al guardar, además de quién puede modificarla.

## ADDED Requirements

### Requirement: Public branding settings are readable without authentication
The system SHALL expose the store name, logo and palette to any visitor without requiring sign-in. The response MUST contain no secrets and no private customer data.

#### Scenario: Anonymous read
- **WHEN** an anonymous client requests the public store settings
- **THEN** the system returns the name, logo and palette

### Requirement: Settings reads are cached
The system SHALL serve repeated reads of the public settings from a cache so that normal page views do not query the data source each time. A cached value MUST NOT be older than 60 seconds after a change has been saved.

#### Scenario: Repeated reads
- **WHEN** many visitors load pages within the same minute without any change
- **THEN** the data source is read at most once for that minute

#### Scenario: Conditional request
- **WHEN** a client repeats a request with the validator of the version it already has and nothing changed
- **THEN** the system answers that the content is unchanged and sends no body

### Requirement: Saved changes reach visitors within 60 seconds
The system SHALL make a saved change visible to every visitor no later than 60 seconds after saving, without a new deployment.

#### Scenario: Name edited
- **WHEN** an administrator saves a new store name
- **THEN** visitors who load a page more than 60 seconds later see the new name

#### Scenario: Palette edited
- **WHEN** an administrator saves a new primary color
- **THEN** pages loaded more than 60 seconds later use the new palette

### Requirement: Branding is applied on first paint
The system MUST render the configured palette and name in the initial page response so that visitors do not see the default colors or name change after load.

#### Scenario: No flash of default colors
- **WHEN** a visitor loads any page while a non-default palette is configured
- **THEN** the first rendered frame already uses the configured palette

### Requirement: Defaults are used when settings are unavailable
The system SHALL fall back to the last known valid settings and, if none exist, to the built-in defaults ("Verashoe" and the default palette) when the settings source cannot be read. The shop MUST keep working and MUST NOT show an error to the visitor.

#### Scenario: Source unavailable with a previous value
- **WHEN** the settings source fails after a valid value was served earlier
- **THEN** the shop keeps showing that last valid value

#### Scenario: Source unavailable on first read
- **WHEN** the settings source fails and no earlier value exists
- **THEN** the shop shows the built-in defaults and remains usable

### Requirement: Only authorized administrators can change settings
The system MUST accept changes to the store settings only from a signed-in user with the manager role. Each change SHALL be validated as a whole and either saved completely or rejected with errors per field.

#### Scenario: Unauthorized write
- **WHEN** an anonymous visitor or a customer tries to change the settings
- **THEN** the system refuses the request and changes nothing

#### Scenario: Invalid field
- **WHEN** a manager submits a change with an invalid field
- **THEN** the system saves nothing and returns an error naming that field

#### Scenario: Valid change
- **WHEN** a manager submits a valid change
- **THEN** the system saves it and the previous values are replaced entirely
