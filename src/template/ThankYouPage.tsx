import { useEffect, useState } from "react";

import { PageShell, RenderSection } from "./LandingPage";
import { R, fill, telHref } from "./rich";
import type { PageConfig, SectionOf } from "./types";

/** Reads the first name the lead form stored before redirecting. */
function useLeadFirstName() {
  const [name, setName] = useState("");
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("rggLead");
      if (!raw) return;
      let n = raw.trim();
      if (n.charAt(0) === "{") {
        const parsed = JSON.parse(raw) as { firstname?: string; firstName?: string };
        n = (parsed.firstname || parsed.firstName || "").trim();
      }
      if (n && !["undefined", "null"].includes(n.toLowerCase())) setName(n);
    } catch {
      /* generic greeting stays */
    }
  }, []);
  return name;
}

export function ThankYouPage({
  config,
  preview = false,
}: {
  config: PageConfig;
  preview?: boolean;
}) {
  const stored = useLeadFirstName();
  const firstName = stored || (preview ? "John" : "");
  const ty = config.thankYou;
  const { brand } = config;
  const tokens = {
    phone: brand.phoneDisplay,
    partner: brand.partnerName,
    rgg: brand.rggName,
    firstName,
  };
  const f = (s: string) => fill(s, tokens);
  const chrome = (type: string) => config.sections.find((s) => s.type === type && !s.hidden);
  const topbar = chrome("topbar");
  const footer = chrome("footer");
  const callbar = chrome("callbar");

  const greeting = firstName ? f(ty.greetingNamed) : f(ty.greeting);
  const hero = config.sections.find((s) => s.type === "hero") as SectionOf<"hero"> | undefined;
  const photo = ty.photo || hero?.props.image || "";
  const quote = config.sections.find((s) => s.type === "quote") as SectionOf<"quote"> | undefined;
  const sigName = ty.signatureName || quote?.props.name || "";
  const sigRole = ty.signatureRole || quote?.props.role || "";

  const actions = (
    <div className="ty-actions">
      {ty.primaryLabel && (
        <a className="btn btn-solid" href={ty.primaryUrl} target="_blank" rel="noopener noreferrer">
          {f(ty.primaryLabel)}
        </a>
      )}
      {ty.showCallButton && (
        <a
          className={
            ty.style === "light" || ty.style === "portrait-light" ? "btn btn-navy" : "btn btn-ghost"
          }
          href={telHref(brand)}
        >
          {f(ty.callLabel)}
        </a>
      )}
    </div>
  );

  return (
    <PageShell config={config} preview={preview} firstName={firstName}>
      {topbar && <RenderSection section={topbar} />}
      {ty.style === "portrait" || ty.style === "portrait-light" ? (
        <section
          className={"hero ty-portrait" + (ty.style === "portrait-light" ? " is-light" : "")}
          data-sid="thankyou"
        >
          <div className="hero-rays" aria-hidden="true"></div>
          <div className="hero-vig" aria-hidden="true"></div>
          <div className="wrap hero-grid">
            <figure className="hero-figure">
              {photo && (
                <img
                  src={photo}
                  alt={hero ? f(hero.props.imageAlt) : brand.partnerName}
                  width={hero?.props.imageWidth ?? 820}
                  height={hero?.props.imageHeight ?? 986}
                  fetchPriority="high"
                />
              )}
            </figure>
            <div className="hero-form ty-msg">
              {greeting && <p className="ty-greet">{greeting}</p>}
              <h1>{f(ty.headline)}</h1>
              <R as="p" className="ty-sub" text={ty.body} />
              {actions}
              {ty.showSignature && sigName && (
                <div className="sigwrap">
                  <div className="sig">{f(sigName)}</div>
                  <span className="sig-rule" aria-hidden="true"></span>
                  {sigRole && <div className="sig-role">{f(sigRole)}</div>}
                </div>
              )}
              {ty.note && <p className="ty-note">{f(ty.note)}</p>}
            </div>
          </div>
        </section>
      ) : ty.style === "dark" ? (
        <section className="ty-dark" data-sid="thankyou">
          <div className="wrap">
            {greeting && <p className="sig">{greeting}</p>}
            <span className="sig-rule" aria-hidden="true"></span>
            <h1>{f(ty.headline)}</h1>
            <R as="p" className="ty-sub" text={ty.body} />
            {actions}
            {ty.note && <p className="ty-note">{f(ty.note)}</p>}
          </div>
        </section>
      ) : (
        <section className="ty-light" data-sid="thankyou">
          <div className="wrap">
            <h1>{firstName ? f(ty.greetingNamed) : f(ty.headline)}</h1>
            <R as="p" className="ty-sub" text={ty.body} />
            {actions}
            {ty.note && <p className="ty-note">{f(ty.note)}</p>}
          </div>
        </section>
      )}
      {footer && <RenderSection section={footer} />}
      {callbar && <RenderSection section={callbar} />}
    </PageShell>
  );
}
