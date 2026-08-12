# Courier Guy Integration Notes

## Verified official sources

- Official API documentation: https://thecourierguy.co.za/api-docs/
- Official business integration page: https://thecourierguy.co.za/business-courier-services/
- Official parcel tracking page: https://thecourierguy.co.za/tracking/

## Findings

The Courier Guy officially advertises a Standard API integration and a separate Locker API. The official business page says standard API credentials are provided by The Courier Guy closer to software transition and that sandbox testing is available before going live. The official API documentation page was protected by CAPTCHA in the browser and did not expose a stable public endpoint specification through static extraction, so the implementation should not guess API endpoints, authentication headers, webhook contracts, or credential names.

The current application therefore implements a safe carrier fallback: admins can save a tracking number, carrier, optional custom tracking URL, and customer-facing note. For a carrier named The Courier Guy, the customer timeline generates a link to the official tracking page using the saved waybill number. A full automatic shipment booking/status synchronization should be added only after the user supplies the official Standard API credentials and endpoint/authentication details from The Courier Guy.

## Implementation decision

Proceed with the deterministic in-app timeline and official tracking-link fallback now. Keep Courier Guy API synchronization as a credential-gated follow-up rather than fabricating an undocumented integration.
