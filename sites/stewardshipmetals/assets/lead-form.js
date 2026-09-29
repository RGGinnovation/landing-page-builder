(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Revelation Gold Group - custom lead form -> HubSpot Forms API
     Portal 44817109 / stewardshipmetals.com (theDove)

     A native HubSpot form submission is posted to the Forms API, so the
     contact is created or updated on the same form, the submission shows
     on the form's timeline, and any workflow enrolled on "form submitted"
     fires exactly as it would with the embedded form.
  ------------------------------------------------------------------ */

  var CONFIG = {
    PORTAL_ID: "44817109",
    FORM_GUID: "PASTE_HUBSPOT_FORM_GUID",
    THANK_YOU_URL: "/thank-you/",
    KIFLO_FIELD: "kiflo_tracking_code",

    // Kiflo. This page is promoted on air as a spoken domain ("go to stewardshipmetals.com"),
    // so visitors never arrive with a ?kfl_ln= referral parameter and Kiflo's cookie is
    // never set. On this page the DOMAIN is the partner identifier, so the partner's
    // referral code is sent explicitly with every lead.
    KIFLO_API_KEY: "5c0ef1cb-8acb-4782-858e-42e2fc672de4",
    KIFLO_PARTNER_CODE: "PASTE_KIFLO_CODE",
    PHONE_DISPLAY: "(888) 465-3049",
    PHONE_HREF: "tel:+18884653049",
    DEBUG: false
  };

  var ENDPOINT =
    "https://api.hsforms.com/submissions/v3/integration/submit/" +
    CONFIG.PORTAL_ID + "/" + CONFIG.FORM_GUID;

  var form = document.getElementById("rggForm");
  if (!form) return;

  var btn     = document.getElementById("rggSubmit");
  var note    = document.getElementById("rggNote");
  var kiflo   = document.getElementById("f_kiflo");
  var btnLbl  = btn.querySelector(".lbl");
  var btnText = btnLbl.textContent;
  var sending = false;

  function log() {
    if (!CONFIG.DEBUG) return;
    var a = [].slice.call(arguments); a.unshift("[RGG]");
    console.log.apply(console, a);
  }

  /* ---------------- Kiflo partner attribution ---------------- */

  function trackingCode() {
    if (typeof window.kiflo !== "function") return "";
    try { return window.kiflo("getTrackingCode") || ""; }
    catch (e) { log("kiflo threw", e); return ""; }
  }

  // Kiflo attributes a lead from request headers only: KFL_KEY (its cookie) or
  // Kiflo-Referral-Code (normally taken from ?kfl_ln= in the URL). The SDK's
  // kiflo('lead', ...) helper can only use what it finds in the URL or the cookie,
  // which on a spoken-domain page is nothing -- leads land "Unassigned".
  // So we make the same POST the SDK makes and set the referral code ourselves.
  function kifloCookie() {
    var m = document.cookie.match(/(?:^|;\s*)kfl_key=([^;]+)/);
    return m ? m[1] : "";
  }

  function kifloReferralCode() {
    // A real referral link always wins over the page's own partner code.
    try {
      var q = new URLSearchParams(window.location.search).get("kfl_ln");
      if (q) return q;
    } catch (e) {}
    var code = CONFIG.KIFLO_PARTNER_CODE;
    if (!code || code.indexOf("PASTE_") === 0) return "";
    return code;
  }

  function createKifloLead(done) {
    var fired = false;
    function once(tag, payload) {
      if (fired) return;
      fired = true;
      clearTimeout(timer);
      log("kiflo lead " + tag, payload);
      done();
    }
    var timer = setTimeout(function () { once("timed out"); }, 2500);

    var cookie = kifloCookie();
    var code   = kifloReferralCode();

    if (!cookie && !code) {
      console.warn("[RGG] No Kiflo referral code. Set CONFIG.KIFLO_PARTNER_CODE or the lead will be Unassigned.");
    }

    var d = digits(form.phone.value);
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);

    var headers = {
      "Content-type": "application/json",
      "Authorization": "AppId " + CONFIG.KIFLO_API_KEY,
      "Kiflo-Referrer-Url": window.location.href
    };
    if (cookie) headers["KFL_KEY"] = cookie;
    if (code)   headers["Kiflo-Referral-Code"] = code;

    fetch("https://api.kiflo.com/v3/js", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        action: "lead",
        payload: {
          properties: {
            firstName: form.firstname.value.trim(),
            lastName:  form.lastname.value.trim(),
            email:     form.email.value.trim().toLowerCase(),
            phone:     d.length === 10 ? "(" + d.slice(0,3) + ") " + d.slice(3,6) + "-" + d.slice(6) : form.phone.value.trim()
          }
        }
      })
    })
      .then(function (res) {
        return res.text().then(function (body) {
          if (res.ok) once("ok", body);
          else once("rejected (HTTP " + res.status + ")", body);
        });
      })
      .catch(function (e) { once("network error", e && e.message); });
  }

  function stampKiflo() {
    var code = trackingCode();
    if (code && kiflo) { kiflo.value = code; return true; }
    return false;
  }

  var tries = 0;
  var poll = setInterval(function () {
    tries++;
    if (stampKiflo() || tries > 20) clearInterval(poll);
  }, 500);
  stampKiflo();

  /* ---------------- Validation ---------------- */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  function digits(s) { return (s || "").replace(/\D/g, ""); }

  function fieldOf(input) { return input.closest(".fld"); }

  function setError(input, on, message) {
    var f = fieldOf(input);
    if (!f) return;
    f.classList.toggle("is-err", !!on);
    input.setAttribute("aria-invalid", on ? "true" : "false");
    if (message) {
      var m = f.querySelector(".msg");
      if (m) m.textContent = message;
    }
  }

  function validate(input, quiet) {
    var name = input.name;
    var v = (input.value || "").trim();
    var ok = true, msg = "";

    if (name === "firstname" || name === "lastname") {
      ok = v.length >= 2;
      msg = "Please enter your " + (name === "firstname" ? "first" : "last") + " name.";
    } else if (name === "phone") {
      var d = digits(v);
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      ok = d.length === 10;
      msg = "Please enter a 10 digit US phone number.";
    } else if (input.type === "checkbox") {
      ok = input.checked;
      msg = "Please tick the box so we can send your guide.";
    } else if (name === "email") {
      ok = EMAIL_RE.test(v);
      msg = "Please enter a valid email address.";
    }

    if (!quiet) setError(input, !ok, msg);
    return ok;
  }

  var inputs = [].slice.call(form.querySelectorAll("input[required]"));

  inputs.forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.value.trim()) validate(input);
    });
    input.addEventListener("input", function () {
      var f = fieldOf(input);
      if (f && f.classList.contains("is-err")) validate(input);
    });
  });

  /* ---------------- Phone mask ---------------- */

  var phone = form.querySelector('input[name="phone"]');
  if (phone) {
    phone.addEventListener("input", function () {
      var d = digits(phone.value);
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      d = d.slice(0, 10);
      var out = d;
      if (d.length > 6)      out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
      else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
      else if (d.length > 0) out = "(" + d;
      phone.value = out;
    });
  }

  /* ---------------- HubSpot submission ---------------- */

  function hutk() {
    var m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
    return m ? m[1] : "";
  }

  function payload(opts) {
    opts = opts || {};
    var fields = [];
    function add(name, value) {
      if (value === undefined || value === null || value === "") return;
      fields.push({ objectTypeId: "0-1", name: name, value: String(value) });
    }

    add("firstname", form.firstname.value.trim());
    add("lastname",  form.lastname.value.trim());
    add("email",     form.email.value.trim().toLowerCase());

    var d = digits(form.phone.value);
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    add("phone", d.length === 10 ? "(" + d.slice(0,3) + ") " + d.slice(3,6) + "-" + d.slice(6) : form.phone.value.trim());

    if (!opts.dropKiflo) {
      stampKiflo();
      add(CONFIG.KIFLO_FIELD, kiflo ? kiflo.value : "");
    }

    var body = {
      submittedAt: Date.now(),
      fields: fields,
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };

    var h = hutk();
    if (h) body.context.hutk = h;

    if (opts.consent) {
      body.legalConsentOptions = {
        consent: {
          consentToProcess: true,
          text: "I agree to allow Revelation Gold Group to store and process my personal data, and to contact me about my request."
        }
      };
    }
    return body;
  }

  function post(opts) {
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(opts))
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    });
  }

  function errorText(data) {
    if (!data) return "";
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors.map(function (e) { return (e.errorType || "") + " " + (e.message || ""); }).join(" | ");
    }
    return data.message || "";
  }

  function busy(on) {
    sending = on;
    btn.disabled = on;
    btnLbl.textContent = on ? "Sending…" : btnText;
    var s = btn.querySelector(".spin");
    if (on && !s) {
      s = document.createElement("span");
      s.className = "spin";
      btn.insertBefore(s, btnLbl);
    } else if (!on && s) {
      s.remove();
    }
  }

  function fail(detail) {
    log("submit failed:", detail);
    note.innerHTML =
      "We could not send that just now. Please try again, or call us at " +
      '<a href="' + CONFIG.PHONE_HREF + '">' + CONFIG.PHONE_DISPLAY + "</a> and we will take your request over the phone.";
    note.classList.add("show");
    busy(false);
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (sending) return;

    note.classList.remove("show");

    var bad = null;
    inputs.forEach(function (input) {
      var ok = validate(input);
      if (!ok && !bad) bad = input;
    });
    if (bad) { bad.focus(); return; }

    busy(true);

    // Two things can make a first attempt bounce that are fixable in the browser:
    //   1. the portal requires the legal consent block on this form
    //   2. the hidden kiflo_tracking_code property is not on the HubSpot form yet
    // Retry once for each rather than losing the lead.
    var opts = {};

    function attempt() {
      return post(opts).then(function (r) {
        if (r.ok) return r;
        var txt = errorText(r.data).toLowerCase();
        var again = false;
        if (!opts.consent && (txt.indexOf("consent") > -1 || txt.indexOf("legal") > -1)) {
          opts.consent = true; again = true;
        }
        if (!opts.dropKiflo && txt.indexOf(CONFIG.KIFLO_FIELD) > -1) {
          opts.dropKiflo = true; again = true;
          log("HubSpot rejected " + CONFIG.KIFLO_FIELD + " - add it to the form as a hidden field.");
        }
        return again ? attempt() : r;
      });
    }

    attempt()
      .then(function (r) {
        if (r.ok) {
          try { window.sessionStorage.setItem("rggLead", form.firstname.value.trim()); } catch (e) {}
          createKifloLead(function () { window.location.href = CONFIG.THANK_YOU_URL; });
          return;
        }
        fail(errorText(r.data) || ("HTTP " + r.status));
      })
      .catch(function (e) { fail(e && e.message); });
  });

  /* ---------------- Debug helper ---------------- */

  window.__rggDebug = function () {
    var info = {
      endpoint: ENDPOINT,
      kifloSdkLoaded: typeof window.kiflo === "function",
      kifloPartnerCode: kifloReferralCode() || null,
      kifloCookie: kifloCookie() || null,
      kifloTrackingCode: trackingCode() || null,
      kifloFieldValue: kiflo ? (kiflo.value || null) : null,
      hubspotutk: hutk() || null,
      formFound: !!form,
      pageHost: window.location.host
    };
    console.table(info);
    return info;
  };

  // Manual Kiflo smoke test from the console: window.__rggKifloTest()
  window.__rggKifloTest = function () {
    var code = kifloReferralCode();
    console.log("[RGG] referral code in use:", code || "(NONE - lead would be Unassigned)");
    console.log("[RGG] kfl_key cookie:", kifloCookie() || "(none)");
    return fetch("https://api.kiflo.com/v3/js", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Authorization": "AppId " + CONFIG.KIFLO_API_KEY,
        "Kiflo-Referral-Code": code,
        "Kiflo-Referrer-Url": window.location.href
      },
      body: JSON.stringify({ action: "event", payload: { type: "visit", referralCode: code, currentUrl: window.location.href, sourceUrl: "" } })
    }).then(function (r) {
      return r.text().then(function (b) {
        console.log(r.ok ? "[RGG] Kiflo recognises this referral code." : "[RGG] Kiflo rejected the code (HTTP " + r.status + "): " + b);
        return { status: r.status, body: b };
      });
    });
  };
})();