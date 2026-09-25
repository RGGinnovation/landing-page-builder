import { useEffect, useRef } from "react";

import { KIFLO_API_KEY } from "../constants";
import { attachHubspotEmbed, attachLeadForm } from "../lead-form";
import { R, telHref, useFill, useRender } from "../rich";
import type { HeroProps } from "../types";

/**
 * Hero + lead form. The form markup (ids, names, classes) is kept identical to
 * production because lead-form.ts and HubSpot depend on it. Only labels are editable.
 */
export function Hero({ sid, props }: { sid: string; props: HeroProps }) {
  const { brand, tracking, preview, thankYouHref } = useRender();
  const f = useFill();
  const formRef = useRef<HTMLFormElement>(null);

  const embed = tracking.formMode === "embed";

  useEffect(() => {
    if (!embed) return;
    return attachHubspotEmbed({
      formGuid: tracking.hubspotFormGuid,
      thankYouUrl: thankYouHref,
      kifloApiKey: KIFLO_API_KEY,
      kifloPartnerCode: tracking.kifloPartnerCode,
      debug: tracking.debug,
      preview,
    });
  }, [
    embed,
    tracking.hubspotFormGuid,
    tracking.kifloPartnerCode,
    tracking.debug,
    thankYouHref,
    preview,
  ]);

  useEffect(() => {
    if (embed || !formRef.current) return;
    return attachLeadForm(formRef.current, {
      portalId: tracking.hubspotPortalId,
      formGuid: tracking.hubspotFormGuid,
      thankYouUrl: thankYouHref,
      kifloApiKey: KIFLO_API_KEY,
      kifloPartnerCode: tracking.kifloPartnerCode,
      phoneDisplay: brand.phoneDisplay,
      phoneHref: telHref(brand),
      rggName: brand.rggName,
      debug: tracking.debug,
      preview,
    });
    // Re-attach only when the wiring changes, not on every copy edit.
  }, [
    embed,
    tracking.hubspotPortalId,
    tracking.hubspotFormGuid,
    tracking.kifloPartnerCode,
    tracking.debug,
    brand.phoneDisplay,
    brand.phoneE164,
    brand.rggName,
    thankYouHref,
    preview,
    props.submitLabel,
  ]);

  return (
    <section className="hero" id="request" data-sid={sid}>
      <div className="hero-rays" aria-hidden="true"></div>
      <div className="hero-vig" aria-hidden="true"></div>

      <div className="wrap hero-grid">
        <figure className="hero-figure">
          <img
            src={props.image}
            alt={f(props.imageAlt)}
            width={props.imageWidth}
            height={props.imageHeight}
            fetchPriority="high"
          />
        </figure>

        <div className="hero-form">
          <h1>{f(props.headline)}</h1>

          {embed ? (
            <div className="hs-embed">
              {preview ? (
                <p className="hs-embed-note">
                  HubSpot form {tracking.hubspotFormGuid ? "" : "(no form id yet) "}renders here on
                  the live page.
                </p>
              ) : (
                <div
                  className="hs-form-frame"
                  data-region={tracking.hubspotRegion || "na1"}
                  data-form-id={tracking.hubspotFormGuid}
                  data-portal-id={tracking.hubspotPortalId}
                ></div>
              )}
            </div>
          ) : (
            <form id="rggForm" noValidate ref={formRef}>
              <div className="fields">
                <div className="fld" data-f="firstname">
                  <label htmlFor="f_first">
                    {f(props.firstLabel)} <span className="req">*</span>
                  </label>
                  <input
                    id="f_first"
                    name="firstname"
                    type="text"
                    autoComplete="given-name"
                    required
                  />
                  <p className="msg">Please enter your first name.</p>
                </div>
                <div className="fld" data-f="lastname">
                  <label htmlFor="f_last">
                    {f(props.lastLabel)} <span className="req">*</span>
                  </label>
                  <input
                    id="f_last"
                    name="lastname"
                    type="text"
                    autoComplete="family-name"
                    required
                  />
                  <p className="msg">Please enter your last name.</p>
                </div>
                <div className="fld" data-f="phone">
                  <label htmlFor="f_phone">
                    {f(props.phoneLabel)} <span className="req">*</span>
                  </label>
                  <input
                    id="f_phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(555) 555-5555"
                    required
                  />
                  <p className="msg">Please enter a 10 digit US phone number.</p>
                </div>
                <div className="fld" data-f="email">
                  <label htmlFor="f_email">
                    {f(props.emailLabel)} <span className="req">*</span>
                  </label>
                  <input
                    id="f_email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                  />
                  <p className="msg">Please enter a valid email address.</p>
                </div>
              </div>

              <input type="hidden" name="kiflo_tracking_code" id="f_kiflo" defaultValue="" />

              <button className="btn btn-solid btn-lg btn-block" type="submit" id="rggSubmit">
                <span className="lbl">{f(props.submitLabel)}</span>
              </button>

              <p className="formnote" id="rggNote" role="alert"></p>
            </form>
          )}

          <R as="p" className="fine" text={props.consent} />
        </div>
      </div>
    </section>
  );
}
