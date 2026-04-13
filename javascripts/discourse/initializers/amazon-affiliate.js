import { withPluginApi } from "discourse/lib/plugin-api";

// Maps Amazon hostnames to their corresponding settings key.
// Each regional Amazon storefront requires a separately obtained affiliate tag.
const AMAZON_DOMAINS = {
  "amazon.com":    "affiliate_amazon_com",
  "amazon.co.uk":  "affiliate_amazon_uk",
  "amazon.ca":     "affiliate_amazon_ca",
  "amazon.de":     "affiliate_amazon_de",
  "amazon.fr":     "affiliate_amazon_fr",
  "amazon.it":     "affiliate_amazon_it",
  "amazon.es":     "affiliate_amazon_es",
  "amazon.com.au": "affiliate_amazon_com_au",
  "amazon.co.jp":  "affiliate_amazon_co_jp",
  "amazon.in":     "affiliate_amazon_in",
  "amazon.com.mx": "affiliate_amazon_com_mx",
  "amazon.com.br": "affiliate_amazon_com_br",
  "amazon.nl":     "affiliate_amazon_nl",
  "amazon.pl":     "affiliate_amazon_pl",
  "amazon.se":     "affiliate_amazon_se",
  "amazon.sg":     "affiliate_amazon_sg",
  "amazon.ae":     "affiliate_amazon_ae",
  "amazon.sa":     "affiliate_amazon_sa",
  "amazon.com.tr": "affiliate_amazon_com_tr",
  "amazon.com.be": "affiliate_amazon_com_be",
};

function getAffiliateTag(hostname) {
  const bare = hostname.replace(/^www\./, "");
  const key = AMAZON_DOMAINS[bare];
  return key ? settings[key] || null : null;
}

// Appends or replaces the ?tag= query parameter on any Amazon product URL.
function convertToAffiliate(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const affiliateTag = getAffiliateTag(parsed.hostname);
  if (!affiliateTag) {
    return null;
  }

  parsed.searchParams.set("tag", affiliateTag);
  return parsed.toString();
}

function alreadyProcessed(a) {
  return a.dataset.amazonAffiliateProcessed === "1";
}

function markProcessed(a) {
  a.dataset.amazonAffiliateProcessed = "1";
}

function rewriteAmazonLinks(scope) {
  if (!settings.affiliate_enabled || !scope) {
    return;
  }

  scope.querySelectorAll('a[href*="amazon."]').forEach((a) => {
    if (alreadyProcessed(a)) {
      return;
    }

    const newURL = convertToAffiliate(a.href);
    if (!newURL) {
      return;
    }

    a.href = newURL;
    markProcessed(a);

    // Onebox (link preview) — show full disclaimer text beneath the source line
    if (a.parentNode?.classList?.contains("source")) {
      const label = document.createElement("span");
      label.className = "amazon-affiliate-disclaimer-label";
      label.textContent = settings.affiliate_text;
      a.parentNode.insertBefore(label, a.nextSibling);
    }
    // Inline link — prepend a small #ad badge
    else {
      const badge = document.createElement("span");
      badge.className = "amazon-affiliate-disclaimer-ad";
      badge.textContent = "#ad";
      badge.title = settings.affiliate_text;
      a.parentNode?.insertBefore(badge, a);
    }
  });
}

export default {
  name: "amazon-affiliate",
  initialize() {
    withPluginApi((api) => {
      // Posts: runs for each cooked element (initial load, infinite scroll, edits)
      api.decorateCookedElement((elem) => rewriteAmazonLinks(elem), {
        onlyStream: true,
      });

      // Chat: runs for each chat message render/re-render
      if (api.decorateChatMessage) {
        api.decorateChatMessage((elem) => {
          const cooked = elem.querySelector(".chat-cooked") || elem;
          rewriteAmazonLinks(cooked);
        });
      }
    });
  },
};
