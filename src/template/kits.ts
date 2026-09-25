/**
 * The free guide ("magazine") images offered in the editor's dropdown.
 * To swap or add one: drop the file in /public/assets/rgg/ and edit this list. Nothing else.
 * Product shots are 1568 x 886 (transparent WebP).
 */
export interface KitOption {
  id: string;
  label: string;
  src: string;
  alt: string;
}

export const KIT_OPTIONS: KitOption[] = [
  {
    id: "wealth-guide-2026",
    label: "2026 Wealth Protection Guide + Faithful Steward bonus",
    src: "/assets/rgg/kit-wealth-guide.webp",
    alt: "The 2026 Wealth Protection Guide, the Wealth Protection Magazine, and the bonus Faithful Steward guide",
  },
  {
    id: "guide-2",
    label: "Guide 2 (image pending)",
    src: "/assets/rgg/kit-guide-2-pending.svg",
    alt: "The free Revelation Gold Group guide",
  },
];

export function kitOptionFor(src: string): KitOption | undefined {
  return KIT_OPTIONS.find((k) => k.src === src);
}
