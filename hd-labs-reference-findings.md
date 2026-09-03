# HD Labs reference findings

## 2026-09-02/03 audit notes

The supplied Anabolics SA homepage was reachable and exposed broad product categories, but the visible product cards were not HD Labs-specific.

The supplied Anabolic Hyper HD Labs collection was reachable at https://anabolichyper.com/collections/hd-labs. It showed 57 HD Labs products and exact packaging imagery for multiple catalogue items, including HD Labs Cialis Tabs, HD Labs Clomid Tabs, HD Labs Testaject 250, HD Labs Deca-Durabolin 100, and HD Labs Sustanon 250. The collection’s visible image URLs are Shopify CDN assets and should only be used if the packaging and product identity are exact matches.

The current application database has 74 active HD-labelled products. A primary-image audit found 66 with a primary image and 8 without any image: HD - CJC-1295 with DAC, HD - GHRP-6, HD - HGH Fragment, HD - IGF-1 Lr3, HD - Creatine, HD - D3, HD - Slim Tabs, and HD - ZMA. No image was linked for these eight because the reference evidence inspected so far did not establish an exact HD Labs packaging match.

The Clomid detail-page rendering issue was caused by two image rows on product 1831: a broken/non-attributable secondary media URL was returned before the verified primary image. The server now orders primary images first, then creation time and ID, and the client marks failed image rows and displays a brand-safe initials fallback instead of a broken image icon.
