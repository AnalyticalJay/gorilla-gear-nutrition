# iKhokha Payment-Gateway Assessment

## Official-source findings — 18 August 2026

iKhokha markets **iK Pay API** specifically for custom-built websites and platforms. Its official product page says the API supports card payments, Instant EFT, Google Pay, and Apple Pay. It directs merchants to complete their iKhokha profile, then generate an API key and secret in the Merchant Dashboard under Payments / iK Pay API before integrating.

The official Node.js example identifies a server-created payment request with a merchant-defined external transaction identifier, an amount in cents, ZAR currency, and dedicated callback, success, failure, and cancellation URLs. This structure is compatible with a quote-to-order flow: the existing internal order identifier can be used as the external transaction reference, and the callback can be used to verify and reconcile payment state before fulfilment proceeds.

The merchant must be FICA approved for payouts. The iK Pay Gateway page lists South African card, Instant EFT, Apple Pay, and Google Pay support for custom sites through iK Pay API.

## Implemented flow — 18 August 2026

The supplied merchant credentials were stored as server-side secrets and validated with an authenticated, read-only iKhokha payment-history request. The website now creates an iKhokha hosted payment link only after the customer selects payment for an approved quote; it does not initiate a charge automatically.

Each request uses ZAR cents, a unique Gorilla Gear order reference, iKhokha’s documented HMAC-SHA256 request signing, and dedicated success, failure, cancellation, and callback URLs. The callback does not trust incoming fields to mark an order paid. It uses the stored pay-link ID to retrieve payment status from iKhokha’s authenticated status API, then validates a returned amount when supplied before updating the order. Manual EFT and proof-of-payment approval remain available as a fallback.

## Audit and checkout feedback — 18 August 2026

The system now records every iKhokha hosted-link creation or creation failure with its internal order reference, pay-link identifier, ZAR amount, gateway status, local order/payment state, timestamps, and a safe failure reason when applicable. The Admin Payment-attempt Audit view supports status filtering, search, manual refresh, order drill-through, responsive table/card rendering, and deliberately excludes hosted customer payment URLs and payment credentials.

Customer checkout now disables duplicate selections and displays a spinner with a clear, screen-reader-announced message while a secure iKhokha payment link is generated. Desktop and phone-sized audit layouts were visually verified without creating a payment.

## Source URLs

- https://www.ikhokha.com/ik-pay-api
- https://www.ikhokha.com/ik-pay-gateway
- https://raw.githubusercontent.com/ikhokha/ik-pay-api-examples/main/nodejs/README.md
- https://developer.ikhokha.com/docs/ik-pay-api
