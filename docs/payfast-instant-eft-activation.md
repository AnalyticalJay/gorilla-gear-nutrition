# PayFast Instant EFT Activation Handoff

## What the application now sends

Selecting **PayFast Instant EFT** generates a signed PayFast hosted-payment request with `payment_method=ef`. PayFast documents `ef` as the EFT-only payment method code. The existing **Manual EFT & POP** route remains available for bank transfer and proof-of-payment review.

## Remaining PayFast account requirements

The 400 page reported by the gateway is returned by PayFast after redirect and cannot be corrected by a client-side form change. The merchant account holder must complete the following in the PayFast dashboard or with PayFast support:

1. Confirm the live merchant account is approved and enabled to receive payments.
2. Confirm the configured Merchant ID and Merchant Key belong to that live approved account.
3. Activate **Instant EFT** as a payment method. PayFast describes Instant EFT as an account-activated option and notes it is available on Aggregator accounts.
4. Test with a buyer email address that is not the same email address registered on the PayFast merchant account; PayFast does not permit self-payments.

## Safe testing sequence

After PayFast confirms activation, create a low-value approved quote, select **PayFast Instant EFT**, and verify that PayFast opens its EFT bank-selection journey. Do not submit a real payment from the production test until the merchant confirms the intended account and settlement setup.

## References

- [PayFast Developer Documentation — `payment_method`](https://developers.payfast.co.za/documentation/)
- [PayFast Instant EFT](https://payfast.io/features/payment-methods/instant-eft/)
- [PayFast support — self-payment restriction](https://support.payfast.help/portal/en/kb/articles/why-am-i-getting-a-merchant-is-unable-to-receive-payments-from-the-same-account-error-20-9-2022)
