# Client access test plan and login UX verification

## Production test

Use the production domain `https://gorillagear.co.za` or `https://www.gorillagear.co.za`. An administrator should first confirm that the client account is approved and active. The client must then sign in using their own email and password. Verify that the header shows **Account**, `/products` loads the private catalogue, member pricing is visible, and the account page does not display **Sign In Required**. If the issue recurs, capture the browser, timestamp, email address used, and the browser console/network response; never request or share the client password.

## Admin test access

The admin member preview at `/admin/users/:userId/preview` is intentionally read-only. It reports whether the selected account is approved and active, records the admin and member IDs in the server log, and does not create an impersonation session, expose a password, or create cart/order/payment actions.

## Login UX verification

The `/login` page was verified at desktop and mobile widths. It now provides a visible animated loading state, approval-aware success messaging, credential-specific error guidance, and a status region with `aria-live="polite"`. Automated coverage includes loading and invalid-credential states.
