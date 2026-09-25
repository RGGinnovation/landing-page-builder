/* ------------------------------------------------------------------
   Revelation Gold Group - custom lead form -> HubSpot Forms API + Kiflo

   Ported 1:1 from the production inline script used on usagovmetals.com
   and faithmetals.com. The only change: the per-partner values (portal,
   form GUID, Kiflo partner code, phone) now come from PageConfig instead
   of being hard-coded, and a preview mode blocks real submissions inside
   the builder.

   A native HubSpot form submission is posted to the Forms API, so the
   contact is created or updated on the same form, the submission shows
   on the form's timeline, and any workflow enrolled on "form submitted"
   fires exactly as it would with the embedded form.
------------------------------------------------------------------ */

export interface LeadFormOptions {
  portalId: string;
  formGuid: string;
  thankYouUrl: string;
  kifloApiKey: string;
  kifloPartnerCode: string;
  phoneDisplay: string;
  phoneHref: string;
  rggName: string;
  debug: boolean;
  /** Builder preview: validate, but never post. */
  preview?: boolean;
}

const KIFLO_FIELD = "kiflo_tracking_code";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

type HsError = { errors?: { errorType?: string; message?: string }[]; message?: string };

type AnyWin = Window & { kiflo?: (cmd: string) => string; __rggDebug?: () => unknown };

/* ---------- Kiflo lead: shared by the styled form and the HubSpot embed ---------- */

function readKifloCookie() {
  const m = document.cookie.match(/(?:^|;\s*)kfl_key=([^;]+)/);
  return m ? m[1]! : "";
}

/** A real referral link (?kfl_ln=) always wins over the page's own partner code. */
function referralCode(partnerCode: string) {
  try {
    const q = new URLSearchParams(window.location.search).get("kfl_ln");
    if (q) return q;
  } catch {
    /* ignore */
  }
  if (!partnerCode || partnerCode.indexOf("PASTE_") === 0) return "";
  return partnerCode;
}

/**
 * Kiflo attributes a lead from request headers only: KFL_KEY (its cookie) or
 * Kiflo-Referral-Code (normally taken from ?kfl_ln= in the URL). On a vanity-domain
 * page neither exists, so we make the same POST the SDK makes and set the code ourselves.
 * Always calls done() within 2.5s, so a Kiflo outage never blocks the thank-you redirect.
 */
export function postKifloLead(
  k: { apiKey: string; partnerCode: string; debug: boolean },
  properties: { firstName: string; lastName: string; email: string; phone: string },
  done: () => void,
) {
  let fired = false;
  function once(tag: string, payload?: unknown) {
    if (fired) return;
    fired = true;
    clearTimeout(timer);
    if (k.debug) console.log("[RGG] kiflo lead " + tag, payload);
    done();
  }
  const timer = setTimeout(() => once("timed out"), 2500);

  const cookie = readKifloCookie();
  const code = referralCode(k.partnerCode);
  if (!cookie && !code) {
    console.warn(
      "[RGG] No Kiflo referral code. Set the partner's Kiflo code or the lead will be Unassigned.",
    );
  }

  const headers: Record<string, string> = {
    "Content-type": "application/json",
    Authorization: "AppId " + k.apiKey,
    "Kiflo-Referrer-Url": window.location.href,
  };
  if (cookie) headers["KFL_KEY"] = cookie;
  if (code) headers["Kiflo-Referral-Code"] = code;

  fetch("https://api.kiflo.com/v3/js", {
    method: "POST",
    headers,
    body: JSON.stringify({ action: "lead", payload: { properties } }),
  })
    .then((res) =>
      res.text().then((body) => {
        if (res.ok) once("ok", body);
        else once("rejected (HTTP " + res.status + ")", body);
      }),
    )
    .catch((e) => once("network error", e && e.message));
}

export function attachLeadForm(form: HTMLFormElement, cfg: LeadFormOptions): () => void {
  const ENDPOINT =
    "https://api.hsforms.com/submissions/v3/integration/submit/" +
    cfg.portalId +
    "/" +
    cfg.formGuid;

  const w = window as AnyWin;
  const btn = form.querySelector<HTMLButtonElement>("#rggSubmit")!;
  const note = form.querySelector<HTMLElement>("#rggNote")!;
  const kiflo = form.querySelector<HTMLInputElement>("#f_kiflo");
  const btnLbl = btn.querySelector<HTMLElement>(".lbl")!;
  const btnText = btnLbl.textContent ?? "";
  let sending = false;
  const disposers: (() => void)[] = [];

  const el = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

  function log(...a: unknown[]) {
    if (!cfg.debug) return;
    console.log("[RGG]", ...a);
  }

  /* ---------------- Kiflo partner attribution ---------------- */

  function trackingCode() {
    if (typeof w.kiflo !== "function") return "";
    try {
      return w.kiflo("getTrackingCode") || "";
    } catch (e) {
      log("kiflo threw", e);
      return "";
    }
  }

  function kifloCookie() {
    return readKifloCookie();
  }

  function kifloReferralCode() {
    return referralCode(cfg.kifloPartnerCode);
  }

  function digits(s: string) {
    return (s || "").replace(/\D/g, "");
  }

  function phone10() {
    let d = digits(el("phone").value);
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    return d.length === 10
      ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6)
      : el("phone").value.trim();
  }

  function createKifloLead(done: () => void) {
    postKifloLead(
      { apiKey: cfg.kifloApiKey, partnerCode: cfg.kifloPartnerCode, debug: cfg.debug },
      {
        firstName: el("firstname").value.trim(),
        lastName: el("lastname").value.trim(),
        email: el("email").value.trim().toLowerCase(),
        phone: phone10(),
      },
      done,
    );
  }

  function stampKiflo() {
    const code = trackingCode();
    if (code && kiflo) {
      kiflo.value = code;
      return true;
    }
    return false;
  }

  let tries = 0;
  const poll = setInterval(() => {
    tries++;
    if (stampKiflo() || tries > 20) clearInterval(poll);
  }, 500);
  disposers.push(() => clearInterval(poll));
  stampKiflo();

  /* ---------------- Validation ---------------- */

  function fieldOf(input: HTMLElement) {
    return input.closest(".fld");
  }

  function setError(input: HTMLInputElement, on: boolean, message: string) {
    const f = fieldOf(input);
    if (!f) return;
    f.classList.toggle("is-err", on);
    input.setAttribute("aria-invalid", on ? "true" : "false");
    if (message) {
      const m = f.querySelector(".msg");
      if (m) m.textContent = message;
    }
  }

  function validate(input: HTMLInputElement, quiet?: boolean) {
    const name = input.name;
    const v = (input.value || "").trim();
    let ok = true;
    let msg = "";
    if (name === "firstname" || name === "lastname") {
      ok = v.length >= 2;
      msg = "Please enter your " + (name === "firstname" ? "first" : "last") + " name.";
    } else if (name === "phone") {
      let d = digits(v);
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      ok = d.length === 10;
      msg = "Please enter a 10 digit US phone number.";
    } else if (name === "email") {
      ok = EMAIL_RE.test(v);
      msg = "Please enter a valid email address.";
    }
    if (!quiet) setError(input, !ok, msg);
    return ok;
  }

  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>("input[required]"));

  function on<K extends keyof HTMLElementEventMap>(
    t: HTMLElement,
    ev: K,
    fn: (e: HTMLElementEventMap[K]) => void,
  ) {
    t.addEventListener(ev, fn as EventListener);
    disposers.push(() => t.removeEventListener(ev, fn as EventListener));
  }

  inputs.forEach((input) => {
    on(input, "blur", () => {
      if (input.value.trim()) validate(input);
    });
    on(input, "input", () => {
      const f = fieldOf(input);
      if (f && f.classList.contains("is-err")) validate(input);
    });
  });

  /* ---------------- Phone mask ---------------- */

  const phone = form.querySelector<HTMLInputElement>('input[name="phone"]');
  if (phone) {
    on(phone, "input", () => {
      let d = digits(phone.value);
      if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
      d = d.slice(0, 10);
      let out = d;
      if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
      else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
      else if (d.length > 0) out = "(" + d;
      phone.value = out;
    });
  }

  /* ---------------- HubSpot submission ---------------- */

  function hutk() {
    const m = document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/);
    return m ? m[1] : "";
  }

  type Opts = { consent?: boolean; dropKiflo?: boolean };

  function payload(opts: Opts) {
    const fields: { objectTypeId: string; name: string; value: string }[] = [];
    function add(name: string, value: string | undefined) {
      if (value === undefined || value === null || value === "") return;
      fields.push({ objectTypeId: "0-1", name, value: String(value) });
    }
    add("firstname", el("firstname").value.trim());
    add("lastname", el("lastname").value.trim());
    add("email", el("email").value.trim().toLowerCase());
    add("phone", phone10());
    if (!opts.dropKiflo) {
      stampKiflo();
      add(KIFLO_FIELD, kiflo ? kiflo.value : "");
    }
    const body: Record<string, unknown> & { context: Record<string, string> } = {
      submittedAt: Date.now(),
      fields,
      context: { pageUri: window.location.href, pageName: document.title },
    };
    const h = hutk();
    if (h) body.context["hutk"] = h;
    if (opts.consent) {
      body["legalConsentOptions"] = {
        consent: {
          consentToProcess: true,
          text:
            "I agree to allow " +
            cfg.rggName +
            " to store and process my personal data, and to contact me about my request.",
        },
      };
    }
    return body;
  }

  function post(opts: Opts) {
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(opts)),
    }).then((res) =>
      res
        .json()
        .catch((): HsError => ({}))
        .then((data) => ({ ok: res.ok, status: res.status, data })),
    );
  }

  function errorText(data: {
    errors?: { errorType?: string; message?: string }[];
    message?: string;
  }) {
    if (!data) return "";
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors.map((e) => (e.errorType || "") + " " + (e.message || "")).join(" | ");
    }
    return data.message || "";
  }

  function busy(isOn: boolean) {
    sending = isOn;
    btn.disabled = isOn;
    btnLbl.textContent = isOn ? "Sending…" : btnText;
    let s = btn.querySelector(".spin");
    if (isOn && !s) {
      s = document.createElement("span");
      s.className = "spin";
      btn.insertBefore(s, btnLbl);
    } else if (!isOn && s) {
      s.remove();
    }
  }

  function fail(detail: string) {
    log("submit failed:", detail);
    note.innerHTML =
      "We could not send that just now. Please try again, or call us at " +
      '<a href="' +
      cfg.phoneHref +
      '">' +
      cfg.phoneDisplay +
      "</a> and we will take your request over the phone.";
    note.classList.add("show");
    busy(false);
  }

  on(form, "submit", (ev) => {
    ev.preventDefault();
    if (sending) return;
    note.classList.remove("show");

    let bad: HTMLInputElement | null = null;
    inputs.forEach((input) => {
      const ok = validate(input);
      if (!ok && !bad) bad = input;
    });
    if (bad) {
      (bad as HTMLInputElement).focus();
      return;
    }

    if (cfg.preview) {
      note.textContent = "Preview mode: the form is valid. Nothing was sent to HubSpot or Kiflo.";
      note.classList.add("show");
      return;
    }

    busy(true);

    // Two things can make a first attempt bounce that are fixable in the browser:
    //   1. the portal requires the legal consent block on this form
    //   2. the hidden kiflo_tracking_code property is not on the HubSpot form yet
    // Retry once for each rather than losing the lead.
    const opts: Opts = {};

    function attempt(): Promise<{ ok: boolean; status: number; data: HsError }> {
      return post(opts).then((r) => {
        if (r.ok) return r;
        const txt = errorText(r.data).toLowerCase();
        let again = false;
        if (!opts.consent && (txt.indexOf("consent") > -1 || txt.indexOf("legal") > -1)) {
          opts.consent = true;
          again = true;
        }
        if (!opts.dropKiflo && txt.indexOf(KIFLO_FIELD) > -1) {
          opts.dropKiflo = true;
          again = true;
          log("HubSpot rejected " + KIFLO_FIELD + " - add it to the form as a hidden field.");
        }
        return again ? attempt() : r;
      });
    }

    attempt()
      .then((r) => {
        if (r.ok) {
          try {
            window.sessionStorage.setItem("rggLead", el("firstname").value.trim());
          } catch {
            /* ignore */
          }
          createKifloLead(() => {
            window.location.href = cfg.thankYouUrl;
          });
          return;
        }
        fail(errorText(r.data) || "HTTP " + r.status);
      })
      .catch((e) => fail(e && e.message));
  });

  /* ---------------- Debug helper ---------------- */

  w.__rggDebug = function () {
    const info = {
      endpoint: ENDPOINT,
      kifloSdkLoaded: typeof w.kiflo === "function",
      kifloPartnerCode: kifloReferralCode() || null,
      kifloCookie: kifloCookie() || null,
      kifloTrackingCode: trackingCode() || null,
      kifloFieldValue: kiflo ? kiflo.value || null : null,
      hubspotutk: hutk() || null,
      formFound: !!form,
      pageHost: window.location.host,
      preview: !!cfg.preview,
    };
    console.table(info);
    return info;
  };

  return () => disposers.forEach((d) => d());
}

/* ------------------------------------------------------------------
   Native HubSpot embed (formMode "embed").
   HubSpot renders and submits the form itself. We listen for its v4
   success event to create the Kiflo lead, remember the first name for
   the thank-you greeting, and redirect to this page's thank-you route.
------------------------------------------------------------------ */

export interface EmbedOptions {
  formGuid: string;
  thankYouUrl: string;
  kifloApiKey: string;
  kifloPartnerCode: string;
  debug: boolean;
  preview?: boolean;
}

type HsV4Form = { getFormFieldValues?: () => Promise<{ name: string; value: unknown }[]> };
type HsWin = Window & {
  HubSpotFormsV4?: { getFormFromEvent?: (e: Event) => HsV4Form | undefined };
};

/** The .hs-form-frame div is rendered by the hero; this only wires the success event. */
export function attachHubspotEmbed(cfg: EmbedOptions): () => void {
  if (cfg.preview || !cfg.formGuid) return () => {};

  async function onSuccess(e: Event) {
    const values: Record<string, string> = {};
    try {
      const form = (window as HsWin).HubSpotFormsV4?.getFormFromEvent?.(e);
      const list = (await form?.getFormFieldValues?.()) ?? [];
      for (const f of list) values[f.name.replace(/^\d+-\d+\//, "")] = String(f.value ?? "");
    } catch (err) {
      if (cfg.debug) console.log("[RGG] could not read HubSpot field values", err);
    }
    try {
      if (values["firstname"]) sessionStorage.setItem("rggLead", values["firstname"]);
    } catch {
      /* ignore */
    }
    postKifloLead(
      { apiKey: cfg.kifloApiKey, partnerCode: cfg.kifloPartnerCode, debug: cfg.debug },
      {
        firstName: values["firstname"] ?? "",
        lastName: values["lastname"] ?? "",
        email: (values["email"] ?? "").toLowerCase(),
        phone: values["phone"] ?? "",
      },
      () => {
        window.location.href = cfg.thankYouUrl;
      },
    );
  }

  window.addEventListener("hs-form-event:on-submission:success", onSuccess);
  return () => window.removeEventListener("hs-form-event:on-submission:success", onSuccess);
}
