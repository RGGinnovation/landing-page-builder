import { useMemo, type ReactNode } from "react";

import { SECTIONS } from "./registry";
import { RenderContext, type RenderCtx } from "./rich";
import { themeToStyle } from "./theme";
import type { PageConfig, Section, SectionType } from "./types";

interface Props {
  config: PageConfig;
  /** Where the form redirects after a successful submission. */
  thankYouHref?: string;
  /** Builder preview: blocks form posts, enables click-to-select outlines. */
  preview?: boolean;
  firstName?: string;
  children?: ReactNode;
}

export function PageShell({
  config,
  thankYouHref = "/thank-you",
  preview = false,
  firstName,
  children,
}: Props) {
  const ctx = useMemo<RenderCtx>(
    () => ({
      brand: config.brand,
      tracking: config.tracking,
      preview,
      thankYouHref,
      tokens: {
        phone: config.brand.phoneDisplay,
        partner: config.brand.partnerName,
        rgg: config.brand.rggName,
        firstName,
      },
    }),
    [config.brand, config.tracking, preview, thankYouHref, firstName],
  );
  return (
    <RenderContext.Provider value={ctx}>
      <div className={"lp" + (preview ? " is-preview" : "")} style={themeToStyle(config.theme)}>
        {children}
      </div>
    </RenderContext.Provider>
  );
}

export function RenderSection({ section }: { section: Section }) {
  const def = SECTIONS[section.type as SectionType];
  if (!def) return null;
  const C = def.component as React.ComponentType<{ sid: string; props: unknown }>;
  return <C sid={section.id} props={section.props} />;
}

export function LandingPage(props: Props) {
  const { config } = props;
  return (
    <PageShell {...props}>
      <a className="skip" href="#request">
        Skip to the request form
      </a>
      {config.sections
        .filter((s) => !s.hidden)
        .map((s) => (
          <RenderSection key={s.id} section={s} />
        ))}
    </PageShell>
  );
}
