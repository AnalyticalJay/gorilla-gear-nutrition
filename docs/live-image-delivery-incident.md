# Live Image Delivery Incident

## Evidence collected 28 August 2026

The live product detail route at `https://gorillagear.co.za/products/keifei-tren-e-100-slow` was opened in a fresh browser session. The rendered page showed a broken shared logo and a blank product image container, matching the customer report. The browser console did not show client-side JavaScript errors.

The incident was therefore reproducible on the then-current live deployment and was not limited to the reported customer account. The browser console did not identify a client-side JavaScript issue.

## Confirmed cause and repair

The hosting platform intercepts the reserved `/manus-storage/` URL path before the application server. It continued to return a 307 redirect to a signed CloudFront asset whose response was `application/octet-stream` and `X-Content-Type-Options: nosniff`. This bypassed the application-level MIME correction and can cause browsers to reject the logo and image resources.

The repair introduces `/api/media/` as the application-owned media route. It fetches managed storage bytes server-side and returns them with extension-derived image MIME types and immutable first-party caching. Existing legacy database paths are translated at the product, gallery, and cart response boundary, and every static logo or artwork reference now uses `/api/media/`.

Local verification returned direct `200` responses with `image/png`, `nosniff`, and immutable cache headers for both the logo and representative catalogue product image. The home page, catalogue, and the reported Keifei Tren E product-detail page render their images successfully. The correction is independent of customer or administrator role.
