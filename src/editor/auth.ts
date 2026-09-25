import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { cloudEnabled, supabase } from "@/integrations/supabase/client";

export type AuthState =
  | { status: "local" }
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; session: Session; editor: boolean };

/** Session + editor check. In local mode there is no login. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(
    cloudEnabled ? { status: "loading" } : { status: "local" },
  );

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    async function apply(session: Session | null) {
      if (!alive) return;
      if (!session) return setState({ status: "signed-out" });
      const { data } = await supabase!.rpc("is_page_editor");
      if (alive) setState({ status: "signed-in", session, editor: data === true });
    }
    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      // Defer: calling Supabase inside the callback can deadlock the auth lock.
      setTimeout(() => void apply(session), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function accessToken(): Promise<string | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/admin` },
  });
  if (error) throw new Error(error.message);
  return { needsConfirmation: !data.session };
}

export async function sendMagicLink(email: string) {
  const { error } = await supabase!.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true },
  });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  await supabase?.auth.signOut();
}
