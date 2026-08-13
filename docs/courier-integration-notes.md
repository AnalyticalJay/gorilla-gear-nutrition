# Courier integration notes

## Evidence reviewed

- Official business integration page: https://thecourierguy.co.za/business-courier-services/
- Official API documentation page: https://thecourierguy.co.za/api-docs/

## Findings

The official business page lists WooCommerce, Shopify, Standard API, and Locker API integrations. It states that Standard API testing can begin in a sandbox, that official credentials are provided during the onboarding/software-transition process, and that developers should contact it@thecourierguy.co.za for integration support. The public page does not publish a stable live tracking hostname, request path, authentication header format, response schema, polling limits, or webhook contract.

The API Keys screen supplied by the customer confirms that an account-level API key exists, but it does not identify the Standard API base URL or tracking endpoint. The key must remain server-side and must not be echoed, logged, or embedded in browser code.

The official API documentation page is protected by a CAPTCHA in the available browser session. Its accessible page content did not expose the base URL, sandbox hostname, authorization format, tracking endpoint, scan-event response schema, or webhook contract.

## Implementation decision

The application will retain the current official tracking-page fallback and use a credential-gated server adapter. Live requests will remain disabled until The Courier Guy supplies the official API base URL, tracking endpoint, authentication format, and response example. The implementation must not guess an endpoint based on third-party tracking aggregators.
