# Spec Delta

## Purpose

Define los datos de contacto y de cobro que la tienda muestra al cliente (WhatsApp, dirección, datos bancarios y QR) como configuración editable, y controla dónde y a quién se exponen.

## ADDED Requirements

### Requirement: WhatsApp number is configurable
The system SHALL use the configured WhatsApp number in every customer-facing WhatsApp link and message. The number MUST be stored in international format, digits only.

#### Scenario: Link uses configured number
- **WHEN** a customer opens a WhatsApp link from the checkout, an order or the contact page
- **THEN** the link targets the configured number

#### Scenario: Invalid number rejected
- **WHEN** an administrator saves a number that contains non-digit characters or is shorter than 8 digits
- **THEN** the system rejects it and identifies the number field in the error

### Requirement: Store address is configurable
The system SHALL show the configured address on the contact page and in the footer. When no address is configured, the system MUST omit the address block instead of showing placeholder text.

#### Scenario: Address configured
- **WHEN** an address is configured
- **THEN** the contact page and footer show it

#### Scenario: Address missing
- **WHEN** no address is configured
- **THEN** no address block or placeholder text is shown

### Requirement: Bank transfer details are configurable
The system SHALL show the configured bank name, account number, holder and ID to a customer who chooses bank transfer. Each field MUST be editable by an administrator.

#### Scenario: Customer chooses transfer
- **WHEN** a customer selects bank transfer at checkout
- **THEN** the configured bank details are displayed

#### Scenario: Details changed
- **WHEN** an administrator saves new bank details
- **THEN** customers see the new details on their next visit to checkout or to an order

### Requirement: QR payment image is configurable
The system SHALL show the configured QR image to a customer who chooses QR payment. When no QR is configured, the system MUST tell the customer to coordinate payment through WhatsApp and MUST NOT show technical text such as variable names or file names.

#### Scenario: QR configured
- **WHEN** a QR image is configured and a customer chooses QR payment
- **THEN** the QR image is displayed

#### Scenario: QR not configured
- **WHEN** no QR image is configured and a customer chooses QR payment
- **THEN** the customer sees a message to coordinate payment by WhatsApp and no technical text

### Requirement: Payment details are not public branding data
The system MUST NOT include bank details or the QR image in the public branding payload. It SHALL provide them only in the checkout and in the detail of an order that belongs to the signed-in customer.

#### Scenario: Anonymous visitor
- **WHEN** an anonymous visitor reads the public store settings
- **THEN** the response contains no bank details and no QR image

#### Scenario: Customer with an order
- **WHEN** a signed-in customer opens the detail of their own order
- **THEN** the payment details are displayed

#### Scenario: Another customer's order
- **WHEN** a signed-in customer requests payment details for an order that belongs to someone else
- **THEN** the system denies the request
