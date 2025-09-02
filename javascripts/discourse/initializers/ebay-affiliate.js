import { withPluginApi } from "discourse/lib/plugin-api";

/* ---------------- helpers ---------------- */

function getBaseUrl(url) {
  const m = url.match(/^[^/]+:\/\/([^/?#]+)/);
  return m ? m[1] : null;
}

function getEbayListingId(url) {
  return (
    url.match(/\/itm\/(\d+)\?/)?.[1] ||
    url.match(/\/itm\/(\d+)/)?.[1] ||
    url.match(/\/(\d+)\?/)?.[1] ||
    null
  );
}

function getEbayStoreOrUserName(url) {
  return url.match(/\/(str|usr)\/([^/?#]+)/)?.[2] || null;
}

function getRotationId(url) {
  const hostname = getBaseUrl(url);
  if (!hostname) {
    return null;
  }
  const tld = hostname.split(".").pop();

  const rotIds = {
    at: "5221-53469-19255-0",
    au: "705-53470-19255-0",
    be: "1553-53471-19255-0",
    ca: "706-53473-19255-0",
    ch: "5222-53480-19255-0",
    de: "707-53477-19255-0",
    es: "1185-53479-19255-0",
    fr: "709-53476-19255-0",
    ie: "5282-53468-19255-0",
    uk: "710-53481-19255-0",
    it: "724-53478-19255-0",
    nl: "1346-53482-19255-0",
    pl: "4908-226936-19255-0",
    com: "711-53200-19255-0",
  };

  return rotIds[tld];
}

function convertToAffiliate(url, affiliateId) {
  const hostname = getBaseUrl(url);
  const rotationId = getRotationId(url);
  if (!affiliateId || !hostname || !rotationId) {
    return null;
  }

  if (url.includes("/itm/")) {
    const listingId = getEbayListingId(url);
    if (listingId) {
      return `https://${hostname}/itm/${listingId}?mkevt=1&mkcid=1&mkrid=${rotationId}&campid=${affiliateId}&toolid=1001`;
    }
  } else if (url.includes("/str/")) {
    const storeName = getEbayStoreOrUserName(url);
    if (storeName) {
      return `https://${hostname}/str/${storeName}?mkevt=1&mkcid=1&mkrid=${rotationId}&campid=${affiliateId}&toolid=1001`;
    }
  } else if (url.includes("/usr/")) {
    const username = getEbayStoreOrUserName(url);
    if (username) {
      return `https://${hostname}/usr/${username}?mkevt=1&mkcid=1&mkrid=${rotationId}&campid=${affiliateId}&toolid=1001`;
    }
  }
  return null;
}

function alreadyAffiliated(a) {
  return a.dataset.ebayAffiliateProcessed === "1";
}

function markProcessed(a) {
  a.dataset.ebayAffiliateProcessed = "1";
}

function rewriteEbayLinks(scope) {
  const affiliateId = settings.affiliate_id;
  if (!affiliateId || !scope) {
    return;
  }

  const links = scope.querySelectorAll('a[href*="ebay."]');
  links.forEach((a) => {
    if (alreadyAffiliated(a)) {
      return;
    }

    const newURL = convertToAffiliate(a.href, affiliateId);
    if (!newURL) {
      return;
    }

    a.href = newURL;
    markProcessed(a);

    // onebox
    if (a.parentNode?.classList?.contains("source")) {
      const label = document.createElement("span");
      label.className = "ebay-affiliate-disclaimer-label";
      label.textContent = settings.affiliate_text;
      a.parentNode.insertBefore(label, a.nextSibling);
    }
    // inline
    else {
      const tag = document.createElement("span");
      tag.className = "ebay-affiliate-disclaimer-ad";
      tag.textContent = "#ad";
      tag.title = settings.affiliate_text;
      a.parentNode?.insertBefore(tag, a);
    }
  });
}

/* ---------------- initializer (posts + chat) ---------------- */

export default {
  name: "ebay-affiliate",
  initialize() {
    withPluginApi((api) => {
      // Topics: runs for each cooked post element (initial, infinite scroll, edits)
      api.decorateCookedElement((elem) => rewriteEbayLinks(elem), {
        onlyStream: true,
      });

      // Chat: runs for each chat message render/re-render
      if (api.decorateChatMessage) {
        api.decorateChatMessage((elem /*, helper */) => {
          const cooked = elem.querySelector(".chat-cooked") || elem;
          rewriteEbayLinks(cooked);
        });
      }
    });
  },
};
