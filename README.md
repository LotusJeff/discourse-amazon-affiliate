# Discourse Ebay Affiliate Theme Component

> Discourse Meta topic: https://meta.discourse.org/t/ebay-epn-affiliate-link-generator/292012

This theme component *replaces* eBay links with affiliate links and *discloses* when this has happened

Requirement: you will need an EPN account https://partnernetwork.ebay.com/
Add your EPN affiliate ID in the settings. 

`https://www.ebay.com/itm/[item id]`

:arrow_down: 

`https://www.ebay.com/itm/[item id]?mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=[affiliate id]&toolid=1001`

This component will replace /itm/ /usr/ and /str/ eBay URLs.

Additionally, links appearing in the "Popular Links" section will also be replaced and disclosed when applicable.

# Explanation
```
api.decorateCookedElement ...
```
This section finds all ebay URLs in a post and attempts to replace them. The disclosure elements are then added to the post.

```
api.reopenWidget ...
```
This section overrides the " ```topic-map-link"``` widget to attempt to replace and disclose any eBay URL in the "Popular Link" section. *Note: because it overrides a widget, it is most vulnerable to breaking if the core Discourse source changes.*
