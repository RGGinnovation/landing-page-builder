import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Field } from "@/template/fields";

import { ImageUpload } from "./fields";
import { getAt, type Path } from "./path";

type OnChange = (path: Path, value: unknown) => void;

interface Props {
  fields: Field[];
  value: unknown;
  /** Path prefix of `value` inside the page config. */
  base: Path;
  onChange: OnChange;
}

export function FieldEditor({ fields, value, base, onChange }: Props) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <FieldRow
          key={f.key}
          field={f}
          value={getAt(value, [f.key])}
          path={[...base, f.key]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function Label({ children, help }: { children: ReactNode; help?: string | undefined }) {
  return (
    <div className="mb-1.5">
      <div className="text-[12px] font-medium text-foreground">{children}</div>
      {help && <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{help}</div>}
    </div>
  );
}

function FieldRow({
  field: f,
  value,
  path,
  onChange,
}: {
  field: Field;
  value: unknown;
  path: Path;
  onChange: OnChange;
}) {
  const set = (v: unknown) => onChange(path, v);
  switch (f.type) {
    case "heading":
      return (
        <div className="border-t pt-4 first:border-t-0 first:pt-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {f.label}
          </div>
          {f.help && <div className="mt-1 text-[11px] text-muted-foreground">{f.help}</div>}
        </div>
      );
    case "text":
    case "url":
      return (
        <div>
          <Label help={f.help}>{f.label}</Label>
          <Input
            className="h-8 text-[13px]"
            value={(value as string) ?? ""}
            placeholder={f.placeholder}
            onChange={(e) => set(e.target.value)}
          />
        </div>
      );
    case "textarea":
    case "rich":
      return (
        <div>
          <Label help={f.help}>{f.label}</Label>
          <Textarea
            className="min-h-0 text-[13px] leading-snug"
            rows={f.rows ?? 3}
            value={(value as string) ?? ""}
            onChange={(e) => set(e.target.value)}
          />
        </div>
      );
    case "number":
      return (
        <div>
          <Label help={f.help}>{f.label}</Label>
          <Input
            type="number"
            className="h-8 text-[13px]"
            value={value === undefined || value === null ? "" : String(value)}
            min={f.min}
            max={f.max}
            step={f.step}
            onChange={(e) => set(e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </div>
      );
    case "toggle":
      return (
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <Label help={f.help}>{f.label}</Label>
          <Switch checked={!!value} onCheckedChange={(v) => set(v)} />
        </label>
      );
    case "select":
      return (
        <div>
          <Label help={f.help}>{f.label}</Label>
          <select
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-[13px]"
            value={(value as string) ?? ""}
            onChange={(e) => set(e.target.value)}
          >
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={f.label}
            className="h-8 w-9 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
            value={/^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : "#000000"}
            onChange={(e) => set(e.target.value.toUpperCase())}
          />
          <div className="min-w-0 flex-1 text-[12px] font-medium">{f.label}</div>
          <Input
            className="h-8 w-24 font-mono text-[12px]"
            value={(value as string) ?? ""}
            onChange={(e) => set(e.target.value)}
          />
        </div>
      );
    case "image":
      return (
        <ImageField label={f.label} help={f.help} value={(value as string) ?? ""} onChange={set} />
      );
    case "stringList":
      return (
        <StringList
          label={f.label}
          help={f.help}
          itemLabel={f.itemLabel ?? "Item"}
          rich={!!f.rich}
          value={(value as string[]) ?? []}
          onChange={set}
        />
      );
    case "list":
      return (
        <ObjectList
          field={f}
          value={(value as Record<string, unknown>[]) ?? []}
          path={path}
          onChange={onChange}
        />
      );
  }
}

/* ------------------------------------------------------------------ */

function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}

function ItemTools({
  onUp,
  onDown,
  onDelete,
}: {
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        className="rounded p-1 text-muted-foreground hover:bg-muted"
        onClick={onUp}
        title="Move up"
      >
        <ArrowUp className="size-3.5" />
      </button>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground hover:bg-muted"
        onClick={onDown}
        title="Move down"
      >
        <ArrowDown className="size-3.5" />
      </button>
      <button
        type="button"
        className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
        onClick={onDelete}
        title="Remove"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function StringList(p: {
  label: string;
  help?: string | undefined;
  itemLabel: string;
  rich: boolean;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const { value, onChange } = p;
  return (
    <div>
      <Label help={p.help}>{p.label}</Label>
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="rounded-md border bg-muted/30 p-1.5">
            <div className="mb-1 flex items-center justify-between pl-1">
              <span className="text-[11px] text-muted-foreground">
                {p.itemLabel} {i + 1}
              </span>
              <ItemTools
                onUp={() => onChange(move(value, i, -1))}
                onDown={() => onChange(move(value, i, 1))}
                onDelete={() => onChange(value.filter((_, j) => j !== i))}
              />
            </div>
            {p.rich || v.length > 60 ? (
              <Textarea
                className="min-h-0 bg-background text-[13px] leading-snug"
                rows={Math.min(6, Math.max(2, Math.ceil(v.length / 48)))}
                value={v}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ) : (
              <Input
                className="h-8 bg-background text-[13px]"
                value={v}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              />
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-full text-[12px]"
          onClick={() => onChange([...value, ""])}
        >
          <Plus className="size-3.5" /> Add {p.itemLabel.toLowerCase()}
        </Button>
      </div>
    </div>
  );
}

function ObjectList({
  field,
  value,
  path,
  onChange,
}: {
  field: Extract<Field, { type: "list" }>;
  value: Record<string, unknown>[];
  path: Path;
  onChange: OnChange;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const set = (v: unknown) => onChange(path, v);
  return (
    <div>
      <Label help={field.help}>{field.label}</Label>
      <div className="space-y-1.5">
        {value.map((item, i) => (
          <div key={i} className="rounded-md border">
            <div className="flex items-center gap-1 px-1.5 py-1">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-1 text-left text-[12px] font-medium"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {open === i ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
                <span className="truncate">
                  {field.itemLabel ?? "Item"} {i + 1}
                  {field.summary ? ` · ${field.summary(item)}` : ""}
                </span>
              </button>
              <ItemTools
                onUp={() => set(move(value, i, -1))}
                onDown={() => set(move(value, i, 1))}
                onDelete={() => set(value.filter((_, j) => j !== i))}
              />
            </div>
            {open === i && (
              <div className="border-t p-2.5">
                <FieldEditor
                  fields={field.fields}
                  value={item}
                  base={[...path, i]}
                  onChange={onChange}
                />
              </div>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-full text-[12px]"
          onClick={() => {
            set([...value, field.newItem()]);
            setOpen(value.length);
          }}
        >
          <Plus className="size-3.5" /> Add {(field.itemLabel ?? "item").toLowerCase()}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ImageField(p: {
  label: string;
  help?: string | undefined;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label help={p.help}>{p.label}</Label>
      <ImageUpload value={p.value} onChange={(src) => p.onChange(src)} />
    </div>
  );
}
