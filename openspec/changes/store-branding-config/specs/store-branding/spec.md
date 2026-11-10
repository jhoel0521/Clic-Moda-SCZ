# Spec Delta

## Purpose

Define la identidad visual de la tienda (nombre, logo y paleta de marca) como datos editables, y exige que se apliquen de forma consistente en toda la shop sin tocar código.

## ADDED Requirements

### Requirement: Store name is configurable
The system SHALL show the configured store name wherever the shop identifies itself to a customer (header, footer, page titles, order ticket and WhatsApp messages). When no name has been configured, the system MUST use "Verashoe".

#### Scenario: Default name
- **WHEN** no store name has been configured
- **THEN** every customer-facing place that shows the store name displays "Verashoe"

#### Scenario: Name changed
- **WHEN** an administrator saves a new store name
- **THEN** the new name appears in the header, footer, page titles, order ticket and WhatsApp messages

#### Scenario: No leftover legacy name
- **WHEN** any customer-facing page is rendered
- **THEN** the text "Clic Moda SCZ" does not appear unless it is the configured name

### Requirement: Store logo is optional
The system SHALL display the configured logo image in the header and footer. When no logo is configured, or the image fails to load, the system MUST show the store name as text instead.

#### Scenario: Logo configured
- **WHEN** a logo URL is configured and the image loads
- **THEN** the header and footer show the logo with the store name as its accessible text alternative

#### Scenario: Logo missing or broken
- **WHEN** no logo is configured or the image cannot be loaded
- **THEN** the header and footer show the store name as text and the layout does not break

### Requirement: Brand palette derives from a primary color
The system SHALL let an administrator choose a primary brand color and MUST derive the dark, light and subtle variants used by the shop from it. All shop colors tied to the brand SHALL come from that palette, not from literal values in components.

#### Scenario: Primary color changed
- **WHEN** an administrator saves a new primary color
- **THEN** buttons, links, focus outlines, badges, gradients and selection highlights use the new palette

#### Scenario: Default palette
- **WHEN** no primary color has been configured
- **THEN** the shop uses a default pink palette that itself meets the contrast rules of this capability

### Requirement: Brand colors must meet contrast AA
The system MUST reject a primary color when white text on it has a contrast ratio below 4.5:1, or when the color on the page background has a ratio below 3:1. A rejection SHALL include the contrast ratio obtained and the nearest color that passes.

#### Scenario: Color fails contrast
- **WHEN** an administrator tries to save a primary color whose contrast with white text is 3.96:1
- **THEN** the system does not save it and reports the ratio and a nearest passing color

#### Scenario: Color passes contrast
- **WHEN** an administrator saves a primary color that meets both ratios
- **THEN** the system saves it and applies it to the shop

### Requirement: Admin sees a preview before saving
The administration screen SHALL show a preview of the name, logo and palette applied to representative shop elements before the change is saved.

#### Scenario: Preview while editing
- **WHEN** an administrator edits the name, logo or primary color without saving
- **THEN** the preview reflects the edit and the live shop remains unchanged until saved
