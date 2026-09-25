import { ChevronDown, ImageIcon, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ASSET_LIBRARY } from "@/template/assets";

/* ------------------------------------------------------------------ */
/* Upload context: the store decides where images go (Storage / inline) */
/* ------------------------------------------------------------------ */

export type Uploader = (file: File) => Promise<string>;
export const UploadContext = createContext<Uploader | null>(null);

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function Group({
  id,
  title,
  subtitle,
  open,
  onToggle,
  badge,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={`group-${id}`} className="scroll-mt-4 border-b border-[#e3e3e3] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-6 py-5 text-left transition-colors hover:bg-[#fafafa]"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold tracking-tight text-[#1a1a1a]">{title}</h2>
            {badge}
          </div>
          {subtitle && <p className="mt-0.5 text-[12px] text-[#6b6b6b]">{subtitle}</p>}
        </div>
        <ChevronDown
          className={
            "size-4 shrink-0 text-[#6b6b6b] transition-transform " + (open ? "rotate-180" : "")
          }
        />
      </button>
      {open && <div className="space-y-5 px-6 pb-7">{children}</div>}
    </section>
  );
}

export function Field({
  label,
  help,
  required,
  children,
  aside,
}: {
  label: string;
  help?: ReactNode;
  required?: boolean;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-2">
        <label className="text-[12.5px] font-medium text-[#1a1a1a]">
          {label}
          {required && <span className="ml-0.5 text-[#072b4e]">*</span>}
        </label>
        {aside}
      </div>
      {children}
      {help && <div className="mt-1.5 text-[11.5px] leading-snug text-[#6b6b6b]">{help}</div>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#d6d6d6] bg-white px-3 text-[13.5px] text-[#1a1a1a] outline-none transition-shadow placeholder:text-[#9a9a9a] focus:border-[#072b4e] focus:ring-2 focus:ring-[#072b4e]/15";

export function TextInput(p: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  mono?: boolean;
  onBlur?: () => void;
}) {
  if (p.prefix) {
    return (
      <div className="flex h-10 items-stretch overflow-hidden rounded-lg border border-[#d6d6d6] bg-white focus-within:border-[#072b4e] focus-within:ring-2 focus-within:ring-[#072b4e]/15">
        <span className="flex max-w-[55%] items-center truncate border-r border-[#e3e3e3] bg-[#f5f5f5] px-3 text-[12.5px] text-[#6b6b6b]">
          {p.prefix}
        </span>
        <input
          className="min-w-0 flex-1 px-3 text-[13.5px] text-[#1a1a1a] outline-none placeholder:text-[#9a9a9a]"
          value={p.value}
          placeholder={p.placeholder}
          onChange={(e) => p.onChange(e.target.value)}
          onBlur={p.onBlur}
        />
      </div>
    );
  }
  return (
    <input
      className={inputCls + " h-10" + (p.mono ? " font-mono text-[12.5px]" : "")}
      value={p.value}
      placeholder={p.placeholder}
      onChange={(e) => p.onChange(e.target.value)}
      onBlur={p.onBlur}
    />
  );
}

export function TextArea(p: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <textarea
      className={inputCls + " py-2.5 leading-relaxed" + (p.mono ? " font-mono text-[12px]" : "")}
      rows={p.rows ?? 3}
      value={p.value}
      placeholder={p.placeholder}
      onChange={(e) => p.onChange(e.target.value)}
    />
  );
}

export function Select<T extends string>(p: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        className={inputCls + " h-10 appearance-none pr-9"}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value as T)}
      >
        {p.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6b6b6b]" />
    </div>
  );
}

export function Segmented<T extends string>(p: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  size?: "sm" | "md";
}) {
  const h = p.size === "sm" ? "h-8 text-[12px]" : "h-9 text-[12.5px]";
  return (
    <div className="inline-flex rounded-lg bg-[#ebebeb] p-0.5">
      {p.options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => p.onChange(o.value)}
          className={
            `${h} inline-flex items-center gap-1.5 rounded-md px-3 font-medium transition-colors ` +
            (p.value === o.value
              ? "bg-white text-[#1a1a1a] shadow-sm"
              : "text-[#5c5c5c] hover:text-[#1a1a1a]")
          }
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle(p: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  help?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-[12.5px] font-medium text-[#1a1a1a]">{p.label}</span>
        {p.help && <span className="mt-0.5 block text-[11.5px] text-[#6b6b6b]">{p.help}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={p.checked}
        onClick={() => p.onChange(!p.checked)}
        className={
          "relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors " +
          (p.checked ? "bg-[#072b4e]" : "bg-[#d6d6d6]")
        }
      >
        <span
          className={
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform " +
            (p.checked ? "translate-x-[18px]" : "translate-x-0.5")
          }
        />
      </button>
    </label>
  );
}

export function Pill({
  children,
  tone = "navy",
}: {
  children: ReactNode;
  tone?: "navy" | "charcoal" | "muted";
}) {
  const cls =
    tone === "navy"
      ? "bg-[#072b4e] text-white"
      : tone === "charcoal"
        ? "bg-[#1a1a1a] text-white"
        : "bg-[#ebebeb] text-[#5c5c5c]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Image upload (Webflow-style card)                                   */
/* ------------------------------------------------------------------ */

function fileLabel(src: string) {
  if (!src) return "";
  if (src.startsWith("data:")) return "Uploaded image";
  const last = decodeURIComponent(src.split("?")[0]!.split("/").pop() ?? src);
  return last.replace(/^\d{10,}-[a-z0-9]{5}\./, "image.");
}

export function readImageSize(src: string): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function ImageUpload(p: {
  value: string;
  onChange: (src: string, size: { w: number; h: number } | null) => void;
  /** Checkerboard on dark (logos are light-on-dark). */
  dark?: boolean;
  hint?: string;
  onClear?: () => void;
  clearLabel?: string;
}) {
  const upload = useContext(UploadContext);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  async function onFile(file: File | undefined) {
    if (!file || !upload) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That is not an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Keep images under 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const src = await upload(file);
      const dims = await readImageSize(src);
      p.onChange(src, dims);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const input = (
    <input
      ref={fileRef}
      type="file"
      accept="image/png,image/webp,image/jpeg,image/svg+xml,image/gif"
      className="hidden"
      onChange={(e) => {
        void onFile(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  const bg = p.dark
    ? "bg-[#1a1a1a]"
    : "bg-[repeating-conic-gradient(#ebebeb_0_25%,#fff_0_50%)] bg-[length:14px_14px]";

  if (!p.value) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void onFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileRef.current?.click()}
        className={
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-8 text-center transition-colors " +
          (over
            ? "border-[#072b4e] bg-[#072b4e]/5"
            : "border-[#c9c9c9] bg-[#f7f7f7] hover:bg-[#f0f0f0]")
        }
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin text-[#072b4e]" />
        ) : (
          <ImageIcon className="size-5 text-[#5c5c5c]" />
        )}
        <div className="text-[13px] font-medium text-[#1a1a1a]">Drag your image here</div>
        <div className="text-[12px] text-[#6b6b6b]">
          or click to browse{p.hint ? ` · ${p.hint}` : ""}
        </div>
        {input}
      </div>
    );
  }

  return (
    <div>
      <div
        className={
          "flex overflow-hidden rounded-xl border bg-white transition-colors " +
          (over ? "border-[#072b4e]" : "border-[#e3e3e3]")
        }
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void onFile(e.dataTransfer.files?.[0]);
        }}
      >
        <div className={`flex size-[88px] shrink-0 items-center justify-center p-2 ${bg}`}>
          <img
            src={p.value}
            alt=""
            className="max-h-full max-w-full object-contain"
            onLoad={(e) =>
              setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
            }
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4">
          <div className="truncate text-[13px] font-medium text-[#1a1a1a]">
            {fileLabel(p.value)}
          </div>
          <div className="text-[12px] text-[#6b6b6b]">
            {busy ? "Uploading…" : size ? `${size.w} × ${size.h}` : " "}
            {p.hint && !busy ? ` · ${p.hint}` : ""}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <SmallButton onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}{" "}
          Replace
        </SmallButton>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d6d6d6] bg-white px-3 text-[12px] font-medium text-[#1a1a1a] hover:bg-[#f5f5f5]"
            >
              <ImageIcon className="size-3.5" /> Library
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-h-96 w-80 overflow-auto p-2" align="start">
            {ASSET_LIBRARY.map((g) => (
              <div key={g.group} className="mb-2">
                <div className="px-1 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#6b6b6b]">
                  {g.group}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {g.items.map((it) => (
                    <button
                      key={it.src}
                      type="button"
                      title={it.label}
                      onClick={async () => p.onChange(it.src, await readImageSize(it.src))}
                      className={
                        "flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-[#1a1a1a] p-1 hover:ring-2 hover:ring-[#072b4e]" +
                        (p.value === it.src ? " ring-2 ring-[#072b4e]" : "")
                      }
                    >
                      <img
                        src={it.src}
                        alt={it.label}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </PopoverContent>
        </Popover>
        {p.onClear && (
          <SmallButton onClick={p.onClear}>
            <Trash2 className="size-3.5" /> {p.clearLabel ?? "Remove"}
          </SmallButton>
        )}
      </div>
      {input}
    </div>
  );
}

export function SmallButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d6d6d6] bg-white px-3 text-[12px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function RegenerateButton({
  onClick,
  busy,
  label = "Regenerate",
}: {
  onClick: () => void;
  busy: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[12px] font-medium text-[#072b4e] transition-colors hover:bg-[#072b4e]/8 disabled:opacity-60"
    >
      <RefreshCw className={"size-3.5" + (busy ? " animate-spin" : "")} />
      {busy ? "Rewriting…" : label}
    </button>
  );
}
