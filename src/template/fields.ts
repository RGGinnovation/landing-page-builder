/**
 * Field definitions drive the builder's generic form editor.
 * Add a section = write a component + describe its props here. No editor code needed.
 */
export type Field =
  | { key: string; label: string; type: "text"; help?: string; placeholder?: string }
  | { key: string; label: string; type: "textarea"; help?: string; rows?: number }
  | { key: string; label: string; type: "rich"; help?: string; rows?: number }
  | { key: string; label: string; type: "image"; help?: string }
  | { key: string; label: string; type: "url"; help?: string; placeholder?: string }
  | {
      key: string;
      label: string;
      type: "number";
      help?: string;
      min?: number;
      max?: number;
      step?: number;
    }
  | { key: string; label: string; type: "toggle"; help?: string }
  | { key: string; label: string; type: "color"; help?: string }
  | {
      key: string;
      label: string;
      type: "select";
      help?: string;
      options: { value: string; label: string }[];
    }
  /** Array of strings (or Rich strings). */
  | {
      key: string;
      label: string;
      type: "stringList";
      help?: string;
      rich?: boolean;
      itemLabel?: string;
    }
  /** Array of objects. */
  | {
      key: string;
      label: string;
      type: "list";
      help?: string;
      itemLabel?: string;
      fields: Field[];
      newItem: () => Record<string, unknown>;
      /** Returns the title shown on each collapsed list item. */
      summary?: (item: Record<string, unknown>) => string;
    }
  /** Visual divider / heading inside a form. */
  | { key: string; label: string; type: "heading"; help?: string };

export const RICH_HELP =
  "**bold**  *italic*  [link](https://…)  Enter = new line.  Tokens: {phone} {partner} {rgg}";
