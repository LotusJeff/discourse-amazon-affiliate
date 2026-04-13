# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Discourse **theme component** (not a plugin) that replaces Amazon links in posts with affiliate links and inserts a disclosure label. There is no server-side code — everything runs client-side via Discourse's JavaScript plugin API.

## No Build Process

Discourse theme components are deployed directly via git URL in the Discourse admin panel (Customize > Themes). There is no build step, no `npm install`, no compilation. Edit files and push to git; Discourse pulls the changes.

To test changes: update the component via Discourse admin, then reload the page and view a post containing Amazon links.

## File Roles

- `about.json` — theme metadata (name, version, author)
- `settings.yaml` — defines admin-configurable settings; these become available in JS as the `settings` object
- `javascripts/discourse/initializers/amazon-affiliate.js` — all plugin logic as an ES module initializer
- `common/header.html` — empty placeholder (logic was here in the old `<script type="text/discourse-plugin">` style)
- `common/common.scss` — CSS for the two disclosure elements inserted by the JS

## How the Plugin API Works

The initializer uses `withPluginApi` to register two decorators:

- `api.decorateCookedElement` — processes rendered post HTML (initial load, infinite scroll, edits)
- `api.decorateChatMessage` — processes Discourse chat messages if chat is enabled

Both call `rewriteAmazonLinks()`, which queries all `a[href*="amazon."]` links, rewrites matching ones by appending `?tag=AFFILIATE_TAG` via the URL API, then inserts a disclosure element. A `data-amazon-affiliate-processed` attribute prevents double-processing on re-renders.

Two disclosure styles:
- `.amazon-affiliate-disclaimer-label` — block label shown when the link is inside a `.source` element (onebox/link preview)
- `.amazon-affiliate-disclaimer-ad` — inline `#ad` badge shown otherwise

## Settings

Settings are defined under the `discourse_amazon_affiliate` key in `settings.yaml` and accessed in JS as `settings.<key>`. Each regional Amazon storefront has its own setting; leave a region blank to skip rewriting links for that storefront.

| Setting key | Purpose |
|---|---|
| `affiliate_enabled` | Toggle the component on/off |
| `affiliate_text` | Disclaimer text shown in disclosures |
| `affiliate_amazon_com` | amazon.com (US) |
| `affiliate_amazon_uk` | amazon.co.uk (UK) |
| `affiliate_amazon_ca` | amazon.ca (Canada) |
| `affiliate_amazon_de` | amazon.de (Germany) |
| `affiliate_amazon_fr` | amazon.fr (France) |
| `affiliate_amazon_it` | amazon.it (Italy) |
| `affiliate_amazon_es` | amazon.es (Spain) |
| `affiliate_amazon_com_au` | amazon.com.au (Australia) |
| `affiliate_amazon_co_jp` | amazon.co.jp (Japan) |
| `affiliate_amazon_in` | amazon.in (India) |
| `affiliate_amazon_com_mx` | amazon.com.mx (Mexico) |
| `affiliate_amazon_com_br` | amazon.com.br (Brazil) |
| `affiliate_amazon_nl` | amazon.nl (Netherlands) |
| `affiliate_amazon_pl` | amazon.pl (Poland) |
| `affiliate_amazon_se` | amazon.se (Sweden) |
| `affiliate_amazon_sg` | amazon.sg (Singapore) |
| `affiliate_amazon_ae` | amazon.ae (UAE) |
| `affiliate_amazon_sa` | amazon.sa (Saudi Arabia) |
| `affiliate_amazon_com_tr` | amazon.com.tr (Turkey) |
| `affiliate_amazon_com_be` | amazon.com.be (Belgium) |

## Deployment

Changes pushed to the `main` branch of this GitHub repo are automatically pulled by my production Discourse site. DO NOT suggest changes that require server-side Discourse core modifications. Only suggest changes within the plugin file structure.

## Upstream Reference

This component is based on the eBay affiliate plugin at https://github.com/ScottMastro/discourse-ebay-affiliate. Monitor that repo for significant logic changes (URL handling, `api.decorateCookedElement` usage, disclosure insertion) and port relevant updates.

## Implementation History

This component was originally written for eBay affiliate links and has been migrated to Amazon. The eBay plugin at https://github.com/ScottMastro/discourse-ebay-affiliate is the upstream reference. Key differences between eBay and Amazon affiliate implementations:

- **eBay** reconstructs URLs entirely using rotation IDs per TLD and path-specific patterns (`/itm/`, `/str/`, `/usr/`)
- **Amazon** simply appends `?tag=AFFILIATE_TAG` to any Amazon URL — no URL reconstruction needed
- Amazon multi-part TLDs (`co.uk`, `com.au`, `co.jp`, etc.) require full hostname matching, not TLD-suffix matching

## Amazon Affiliate URL Structure

Amazon affiliate links work by appending `?tag=AFFILIATE_ID` to any Amazon product URL. Each regional Amazon storefront has its own affiliate program requiring a separately obtained tag:

| Domain | Region |
|---|---|
| `amazon.com` | US |
| `amazon.co.uk` | UK |
| `amazon.de` | Germany |
| `amazon.fr` | France |
| `amazon.it` | Italy |
| `amazon.es` | Spain |
| `amazon.ca` | Canada |
| `amazon.com.au` | Australia |
| `amazon.co.jp` | Japan |
| `amazon.in` | India |
| `amazon.com.mx` | Mexico |
| `amazon.com.br` | Brazil |
| `amazon.nl` | Netherlands |
| `amazon.pl` | Poland |
| `amazon.se` | Sweden |
| `amazon.sg` | Singapore |
| `amazon.ae` | UAE |
| `amazon.sa` | Saudi Arabia |
| `amazon.com.tr` | Turkey |
| `amazon.com.be` | Belgium |

Domain detection must handle multi-part TLDs (`co.uk`, `co.jp`, `com.au`, `com.mx`, etc.) — a simple last-segment TLD split is insufficient.

The rewrite logic should: detect the Amazon regional domain from the link href → look up the configured affiliate tag for that region → append or replace the `tag` query parameter.
