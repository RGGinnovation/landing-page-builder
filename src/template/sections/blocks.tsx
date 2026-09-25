import { CheckIcon, GoogleMark, PhoneIcon } from "../icons";
import { kitOptionFor } from "../kits";
import { R, telHref, useFill, useRender } from "../rich";
import type {
  Badge,
  CallbandProps,
  ContentProps,
  KitProps,
  OfferProps,
  QuestionProps,
  QuoteProps,
  ReasonsProps,
  SplitProps,
  WhyProps,
} from "../types";

type P<T> = { sid: string; props: T };

function CallButton({ label }: { label: string }) {
  const { brand } = useRender();
  const f = useFill();
  return (
    <a className="btn btn-call" href={telHref(brand)}>
      <PhoneIcon />
      {f(label)}
    </a>
  );
}

/* ======================= ENDORSEMENT QUOTE ======================= */
export function Quote({ sid, props }: P<QuoteProps>) {
  const f = useFill();
  return (
    <section className="quote" data-sid={sid}>
      <div className="wrap">
        <R as="blockquote" text={"“" + props.quote + "”"} />
        <div className="sigwrap">
          <div className="sig">{f(props.name)}</div>
          <span className="sig-rule" aria-hidden="true"></span>
          <div className="sig-role">{f(props.role)}</div>
        </div>
      </div>
    </section>
  );
}

/* ======================= CALL AN EXPERT ======================= */
export function Callband({ sid, props }: P<CallbandProps>) {
  const f = useFill();
  return (
    <section className="callband" data-sid={sid}>
      <div className="wrap center">
        <h2>
          {f(props.headline)}
          {props.subline && <span className="csub">{f(props.subline)}</span>}
        </h2>
        <CallButton label={props.buttonLabel} />
      </div>
    </section>
  );
}

/* ======================= WHY I BELIEVE ======================= */
const BADGE_IMG: Record<string, { cls: string; src: string; alt: string; w: number; h: number }> = {
  bbb: { cls: "bb", src: "/assets/rgg/bbb.webp", alt: "BBB Accredited Business", w: 300, h: 114 },
  trustpilot: { cls: "tp", src: "/assets/rgg/trustpilot.webp", alt: "Trustpilot", w: 300, h: 74 },
  consumeraffairs: {
    cls: "ca",
    src: "/assets/rgg/consumeraffairs.webp",
    alt: "ConsumerAffairs",
    w: 640,
    h: 103,
  },
};

function BadgeCard({ b }: { b: Badge }) {
  const f = useFill();
  const img = BADGE_IMG[b.kind] ?? BADGE_IMG["bbb"]!;
  const inner =
    b.kind === "google" ? (
      <>
        <GoogleMark />
        <span className="bnum">{b.value}</span>
        <span className="bstars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <span className="blab">{f(b.label)}</span>
      </>
    ) : (
      <>
        <img
          className={img.cls}
          src={img.src}
          alt={img.alt}
          width={img.w}
          height={img.h}
          loading="lazy"
        />
        {b.kind === "trustpilot" && (
          <span className="bstars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        )}
        {b.kind === "bbb" ? (
          <span className="blab">
            {f(b.label)}
            <br />
            <span className="bbig">{f(b.value)}</span>
          </span>
        ) : (
          <span className="blab">{f(b.label)}</span>
        )}
      </>
    );
  // No URL = a plain tile (used for ConsumerAffairs until its profile URL is confirmed).
  return b.url ? (
    <a className="bcard" href={b.url} target="_blank" rel="noopener">
      {inner}
    </a>
  ) : (
    <div className="bcard">{inner}</div>
  );
}

export function Why({ sid, props }: P<WhyProps>) {
  return (
    <section className="pad why" data-sid={sid}>
      <div className="wrap split">
        <div>
          <R as="h2" text={props.headline} />
          {props.paragraphs.map((p, i) => (
            <R key={i} as="p" text={p} />
          ))}
        </div>

        <div className="badgewall">
          {props.badges.map((b, i) => (
            <BadgeCard key={i} b={b} />
          ))}
          {props.note && <p className="bnote">{props.note}</p>}
        </div>
      </div>
    </section>
  );
}

/* ======================= FREE KIT ======================= */
export function Kit({ sid, props }: P<KitProps>) {
  const f = useFill();
  return (
    <section
      className={"pad sec-alt kit" + (props.layout === "wide" ? " kit-wide" : "")}
      data-sid={sid}
    >
      <div className="wrap kitsplit">
        <div className="kitshot">
          <img
            src={props.image}
            alt={f(props.imageAlt)}
            width={kitOptionFor(props.image)?.width ?? 2000}
            height={kitOptionFor(props.image)?.height ?? 1333}
            loading="lazy"
          />
        </div>

        <div>
          <h2>{f(props.headline)}</h2>
          {props.lede && <p className="lede">{f(props.lede)}</p>}
          <ul className="kitpts">
            {props.points.map((pt, i) => (
              <li key={i}>
                <CheckIcon />
                <span>{f(pt)}</span>
              </li>
            ))}
          </ul>
          <a className="btn btn-solid btn-lg" href={props.buttonHref || "#request"}>
            {f(props.buttonLabel)}
          </a>
          {props.footnote && <p className="ships">{f(props.footnote)}</p>}
        </div>
      </div>
    </section>
  );
}

/* ======================= 3 REASONS ======================= */
export function Reasons({ sid, props }: P<ReasonsProps>) {
  const f = useFill();
  return (
    <section className="pad reasons" data-sid={sid}>
      <div className="wrap split">
        <div>
          <R as="h2" text={props.headline} />
          <ol className="rlist">
            {props.items.map((it, i) => (
              <li key={i}>
                <span className="n">{i + 1}</span>
                <R as="p" text={it} />
              </li>
            ))}
          </ol>
          {props.source && (
            <p className={"rsource" + (props.sourceAlign === "center" ? " is-center" : "")}>
              {f(props.source)}
            </p>
          )}
        </div>
        <div>
          <img
            className="coinpair"
            src={props.image}
            alt={f(props.imageAlt)}
            loading="lazy"
            decoding="async"
            width={940}
            height={775}
          />
        </div>
      </div>
    </section>
  );
}

/* ======================= THE 401(k) QUESTION ======================= */
export function Question({ sid, props }: P<QuestionProps>) {
  const f = useFill();
  return (
    <section className="pad qsec" data-sid={sid}>
      <div className="wrap center">
        {props.eyebrow && <p className="eyebrow">{f(props.eyebrow)}</p>}
        <h2>{f(props.headline)}</h2>
        <span className="qrule" aria-hidden="true"></span>

        {props.paragraphs.map((p, i) => (
          <R key={i} as="p" text={p} />
        ))}
        {props.lead && <R as="p" className="qlead" text={props.lead} />}

        {props.accounts.length > 0 && (
          <div className="qgrid">
            {props.accounts.map((a, i) => (
              <span key={i}>{f(a)}</span>
            ))}
          </div>
        )}

        {props.ask && <R as="p" className="qask" text={props.ask} />}

        <CallButton label={props.buttonLabel} />

        {props.altLinkLabel && (
          <p className="qalt">
            {f(props.altPrefix)} <a href="#request">{f(props.altLinkLabel)}</a>
          </p>
        )}

        {props.fine && <p className="qfine">{f(props.fine)}</p>}
      </div>
    </section>
  );
}

/* ======================= SILVER OFFER ======================= */
export function Offer({ sid, props }: P<OfferProps>) {
  const f = useFill();
  return (
    <section className="pad offer" data-sid={sid}>
      <div className="wrap split">
        <div>
          <img
            className="cointrio"
            src={props.image}
            alt={f(props.imageAlt)}
            loading="lazy"
            decoding="async"
            width={940}
            height={718}
          />
        </div>
        <div>
          {props.eyebrow && <p className="eyebrow">{f(props.eyebrow)}</p>}
          <h2>
            <R text={props.headline} />
            {props.asterisk && <span className="ast">&#42;</span>}
          </h2>
          <a className="btn btn-solid btn-lg" href="#request">
            {f(props.buttonLabel)}
          </a>
          {props.terms && <p className="offerterms">{f(props.terms)}</p>}
        </div>
      </div>
    </section>
  );
}

/* ======================= GENERIC: CONTENT (centered text) ======================= */
export function Content({ sid, props }: P<ContentProps>) {
  const f = useFill();
  const bg = props.background === "navy" ? " qsec" : props.background === "alt" ? " sec-alt" : "";
  return (
    <section className={"pad lp-content" + bg} data-sid={sid}>
      <div className="wrap center">
        {props.eyebrow && <p className="eyebrow">{f(props.eyebrow)}</p>}
        <R as="h2" text={props.headline} />
        {props.background === "navy" && <span className="qrule" aria-hidden="true"></span>}
        {props.paragraphs.map((p, i) => (
          <R key={i} as="p" text={p} />
        ))}
        {props.buttonLabel && (
          <a className="btn btn-solid btn-lg" href={props.buttonHref || "#request"}>
            {f(props.buttonLabel)}
          </a>
        )}
      </div>
    </section>
  );
}

/* ======================= GENERIC: SPLIT (image + text) ======================= */
export function Split({ sid, props }: P<SplitProps>) {
  const f = useFill();
  const img = (
    <div>
      <img className="lp-split-img" src={props.image} alt={f(props.imageAlt)} loading="lazy" />
    </div>
  );
  return (
    <section
      className={"pad lp-split kit" + (props.background === "alt" ? " sec-alt" : "")}
      data-sid={sid}
    >
      <div className={"wrap split" + (props.imageSide === "right" ? " rev" : "")}>
        {props.imageSide === "left" && img}
        <div>
          {props.eyebrow && <p className="eyebrow">{f(props.eyebrow)}</p>}
          <R as="h2" text={props.headline} />
          {props.paragraphs.map((p, i) => (
            <R key={i} as="p" text={p} />
          ))}
          {props.bullets.length > 0 && (
            <ul className="kitpts">
              {props.bullets.map((b, i) => (
                <li key={i}>
                  <CheckIcon />
                  <span>{f(b)}</span>
                </li>
              ))}
            </ul>
          )}
          {props.buttonLabel && (
            <a className="btn btn-solid btn-lg" href={props.buttonHref || "#request"}>
              {f(props.buttonLabel)}
            </a>
          )}
        </div>
        {props.imageSide === "right" && img}
      </div>
    </section>
  );
}
