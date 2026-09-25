import { useState } from "react";

import { sendMagicLink, signIn, signOut, signUp } from "./auth";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ebebeb] px-4">
      <div className="w-full max-w-[380px] rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(26,26,26,0.08)]">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#072b4e] text-[12px] font-bold text-white">
            RGG
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold text-[#1a1a1a]">Partner Pages</div>
            <div className="text-[11px] text-[#6b6b6b]">Revelation Gold Group</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const input =
  "h-11 w-full rounded-lg border border-[#d6d6d6] px-3 text-[14px] outline-none focus:border-[#072b4e] focus:ring-2 focus:ring-[#072b4e]/15";

export function Login() {
  const [mode, setMode] = useState<"signin" | "signup" | "link">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signin") await signIn(email, password);
      else if (mode === "signup") {
        const r = await signUp(email, password);
        if (r.needsConfirmation)
          setMsg({ kind: "ok", text: "Check your inbox to confirm your email, then sign in." });
      } else {
        await sendMagicLink(email);
        setMsg({ kind: "ok", text: "Sign-in link sent. Open it on this device." });
      }
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <h1 className="text-[20px] font-semibold tracking-tight text-[#1a1a1a]">
        {mode === "signup" ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-1 text-[12.5px] text-[#6b6b6b]">Use your @revelationgoldgroup.com email.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          className={input}
          type="email"
          autoComplete="email"
          placeholder="you@revelationgoldgroup.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode !== "link" && (
          <input
            className={input}
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="Password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-lg bg-[#072b4e] text-[14px] font-semibold text-white hover:bg-[#0a3a66] disabled:opacity-60"
        >
          {busy
            ? "One moment…"
            : mode === "signin"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Email me a sign-in link"}
        </button>
      </form>
      {msg && (
        <p
          className={
            "mt-3 text-[12.5px] " + (msg.kind === "ok" ? "text-[#072b4e]" : "text-[#1a1a1a]")
          }
        >
          {msg.text}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-between gap-2 text-[12.5px]">
        {mode !== "signin" && (
          <button
            type="button"
            className="font-medium text-[#072b4e] hover:underline"
            onClick={() => setMode("signin")}
          >
            Sign in with password
          </button>
        )}
        {mode !== "link" && (
          <button
            type="button"
            className="font-medium text-[#072b4e] hover:underline"
            onClick={() => setMode("link")}
          >
            Email me a link instead
          </button>
        )}
        {mode !== "signup" && (
          <button
            type="button"
            className="font-medium text-[#072b4e] hover:underline"
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        )}
      </div>
    </Shell>
  );
}

export function NoAccess({ email }: { email: string }) {
  return (
    <Shell>
      <h1 className="text-[20px] font-semibold tracking-tight text-[#1a1a1a]">No editor access</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5c5c5c]">
        <b className="text-[#1a1a1a]">{email}</b> is signed in but cannot edit partner pages.
        Editors need an @revelationgoldgroup.com email, or an admin can add this address to the{" "}
        <code>partner_page_editors</code> table.
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-6 h-11 w-full rounded-lg border border-[#d6d6d6] text-[14px] font-medium hover:bg-[#f5f5f5]"
      >
        Sign out
      </button>
    </Shell>
  );
}
