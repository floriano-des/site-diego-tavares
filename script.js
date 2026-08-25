(function () {
  "use strict";

  const CONSENT_KEY = "dt_cookie_consent_v1";
  const CONSENT_VERSION = 1;
  const GTM_ID = "GTM-WXG4LJBD";
  const SITE_URL = "https://diegotavaresoficial.com.br/";
  const SHARE_TEXT = "Conheça Diego Tavares, candidato a Deputado Federal por São Paulo, número 7066.";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  window.gtag("set", "ads_data_redaction", true);
  window.gtag("set", "url_passthrough", false);

  const consentState = {
    current: readConsent(),
    gtmLoaded: false
  };

  function readConsent() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(CONSENT_KEY));
      if (
        stored &&
        stored.version === CONSENT_VERSION &&
        (stored.choice === "accepted" || stored.choice === "rejected")
      ) {
        return stored.choice;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function storeConsent(choice) {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        choice,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      // O site continua funcional quando o navegador bloqueia armazenamento local.
    }
  }

  function updateGoogleConsent(choice) {
    const value = choice === "accepted" ? "granted" : "denied";
    window.gtag("consent", "update", {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value
    });
  }

  function loadGTM() {
    if (consentState.gtmLoaded || document.getElementById("google-tag-manager")) {
      return;
    }

    consentState.gtmLoaded = true;
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js"
    });

    const script = document.createElement("script");
    script.id = "google-tag-manager";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
    document.head.appendChild(script);
  }

  function deleteCookie(name) {
    const hostname = window.location.hostname;
    const domains = ["", hostname, "." + hostname];
    const paths = ["/"];

    domains.forEach(function (domain) {
      paths.forEach(function (path) {
        const domainPart = domain ? "; Domain=" + domain : "";
        document.cookie = name + "=; Max-Age=0; Path=" + path + domainPart + "; SameSite=Lax";
        document.cookie = name + "=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=" + path + domainPart + "; SameSite=Lax";
      });
    });
  }

  function clearKnownMeasurementCookies() {
    const knownPrefixes = [
      "_ga",
      "_gid",
      "_gat",
      "_gcl",
      "_fbp",
      "_fbc",
      "_clck",
      "_clsk",
      "_ttp",
      "_tt_enable_cookie"
    ];

    document.cookie.split(";").forEach(function (item) {
      const name = item.split("=")[0].trim();
      if (knownPrefixes.some(function (prefix) { return name.indexOf(prefix) === 0; })) {
        deleteCookie(name);
      }
    });
  }

  function setupConsent() {
    const banner = document.getElementById("cookie-banner");
    const accept = document.getElementById("cookie-accept");
    const reject = document.getElementById("cookie-reject");
    const settings = document.getElementById("cookie-settings");
    const more = document.getElementById("cookie-more");
    const privacy = document.getElementById("privacidade");

    if (!banner || !accept || !reject) {
      return;
    }

    function showBanner(focusButton) {
      banner.hidden = false;
      if (focusButton) {
        window.setTimeout(function () { accept.focus(); }, 0);
      }
    }

    function hideBanner() {
      banner.hidden = true;
    }

    function choose(choice) {
      const wasAccepted = consentState.current === "accepted";
      consentState.current = choice;
      storeConsent(choice);
      updateGoogleConsent(choice);

      if (choice === "accepted") {
        hideBanner();
        loadGTM();
        return;
      }

      clearKnownMeasurementCookies();
      hideBanner();

      if (wasAccepted || consentState.gtmLoaded) {
        window.location.reload();
      }
    }

    accept.addEventListener("click", function () { choose("accepted"); });
    reject.addEventListener("click", function () { choose("rejected"); });

    if (settings) {
      settings.addEventListener("click", function () { showBanner(true); });
    }

    if (more && privacy) {
      more.addEventListener("click", function () {
        privacy.open = true;
      });
    }

    if (consentState.current === "accepted") {
      updateGoogleConsent("accepted");
      loadGTM();
    } else if (consentState.current === "rejected") {
      updateGoogleConsent("rejected");
      hideBanner();
    } else {
      showBanner(false);
    }
  }

  function setupMenu() {
    const button = document.querySelector(".menu-toggle");
    const menu = document.getElementById("menu-principal");
    if (!button || !menu) {
      return;
    }

    function closeMenu() {
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Abrir menu");
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }

    button.addEventListener("click", function () {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      button.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
      menu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        closeMenu();
        button.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  function setupShare() {
    const shareButton = document.getElementById("share-site");
    const whatsappLink = document.getElementById("share-whatsapp");
    const copyButton = document.getElementById("copy-link");
    const feedback = document.getElementById("share-feedback");

    if (!shareButton || !whatsappLink || !copyButton || !feedback) {
      return;
    }

    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(SHARE_TEXT + " " + SITE_URL);
    whatsappLink.href = whatsappUrl;

    function showFeedback(message) {
      feedback.textContent = message;
      window.clearTimeout(showFeedback.timeout);
      showFeedback.timeout = window.setTimeout(function () {
        feedback.textContent = "";
      }, 5000);
    }

    function copyWithFallback() {
      const temporary = document.createElement("textarea");
      temporary.value = SITE_URL;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      return copied;
    }

    async function copyLink() {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(SITE_URL);
        } else if (!copyWithFallback()) {
          throw new Error("copy-failed");
        }
        showFeedback("Link copiado.");
      } catch (error) {
        showFeedback("Não foi possível copiar. Use: " + SITE_URL);
      }
    }

    shareButton.addEventListener("click", async function () {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Diego Tavares 7066",
            text: SHARE_TEXT,
            url: SITE_URL
          });
          showFeedback("Obrigado por compartilhar.");
          return;
        } catch (error) {
          if (error && error.name === "AbortError") {
            return;
          }
        }
      }

      const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        await copyLink();
      }
    });

    copyButton.addEventListener("click", copyLink);
  }

  function setupFaq() {
    const details = document.querySelectorAll(".faq-list details");
    details.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) {
          return;
        }
        details.forEach(function (other) {
          if (other !== item) {
            other.open = false;
          }
        });
      });
    });
  }

  function initialize() {
    setupConsent();
    setupMenu();
    setupShare();
    setupFaq();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}());
