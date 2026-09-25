import { PhoneIcon } from "../icons";
import { R, telHref, useFill, useRender } from "../rich";
import type { CallbarProps, FooterProps, TopbarProps } from "../types";

type P<T> = { sid: string; props: T };

export function Topbar({ sid, props }: P<TopbarProps>) {
  const { brand } = useRender();
  const f = useFill();
  return (
    <header className="topbar" id="top" data-sid={sid}>
      <div className="wrap bar">
        <div className="lockup">
          <img
            className="plogo"
            src={brand.partnerLogo}
            alt={brand.partnerName}
            width={brand.partnerLogoWidth}
            height={brand.partnerLogoHeight}
          />
          <span className="sep" aria-hidden="true"></span>
          <img className="rggw" src={brand.rggLogo} alt={brand.rggName} width={620} height={96} />
        </div>
        <a className="topcall" href={telHref(brand)}>
          <PhoneIcon />
          <span>
            <span className="tc-lab">{f(props.callLabel)}</span>
            <span className="tc-num">{brand.phoneDisplay}</span>
          </span>
        </a>
      </div>
    </header>
  );
}

export function Footer({ sid, props }: P<FooterProps>) {
  const { brand } = useRender();
  return (
    <footer className="foot" data-sid={sid}>
      <div className="wrap">
        <a href="#top">
          <img
            className="flogo"
            src={brand.rggFooterLogo}
            alt={brand.rggName}
            width={620}
            height={96}
          />
        </a>

        <div className="fmeta">
          <a href={telHref(brand)}>{brand.phoneDisplay}</a>
          <span aria-hidden="true">&middot;</span>
          <a href={"mailto:" + brand.email.toLowerCase()}>{brand.email}</a>
          <span aria-hidden="true">&middot;</span>
          <a href={brand.addressMapUrl} target="_blank" rel="noopener">
            {brand.address}
          </a>
        </div>

        <div className="disclosure">
          {props.partnerDisclosure && <R as="p" text={props.partnerDisclosure} />}
          {props.disclosures.map((d, i) => (
            <R key={i} as="p" text={d} />
          ))}
        </div>

        <p className="legal-links">
          <span>
            &copy; {brand.copyrightYear} {brand.rggName}. All rights reserved.
          </span>
          {brand.privacyUrl && (
            <a href={brand.privacyUrl} target="_blank" rel="noopener">
              Privacy Policy
            </a>
          )}
          {brand.termsUrl && (
            <a href={brand.termsUrl} target="_blank" rel="noopener">
              Terms &amp; Conditions
            </a>
          )}
          {brand.amlUrl && (
            <a href={brand.amlUrl} target="_blank" rel="noopener">
              AML Policy
            </a>
          )}
        </p>
      </div>
    </footer>
  );
}

export function Callbar({ sid, props }: P<CallbarProps>) {
  const { brand } = useRender();
  const f = useFill();
  return (
    <div className="callbar" data-sid={sid}>
      <a className="btn btn-solid" href={telHref(brand)}>
        <PhoneIcon />
        {f(props.label)}
      </a>
    </div>
  );
}
