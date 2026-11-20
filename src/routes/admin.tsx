import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, fileToDataUrl, formatPrice, productsQuery, type Product } from "@/lib/products";
import mark from "@/assets/ie-mark.png";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Sign in — ie accessories" },
      { name: "description", content: "Manage ie accessories products." },
      { property: "og:title", content: "Sign in — ie accessories" },
      { property: "og:description", content: "Manage ie accessories products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const btn = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50";

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  if (!ready) return <Shell><p className="text-muted-foreground">Loading…</p></Shell>;
  return <Shell>{session ? <Dashboard userId={session.user.id} /> : <AuthForm />}</Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-secondary">
      <header className="bg-graphite text-on-graphite">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={mark} alt="ie" className="h-10 w-10 rounded-full bg-background" />
            <span className="font-display text-lg font-semibold">ie accessories</span>
          </div>
          <Link to="/" className="flex items-center gap-1 text-sm text-on-graphite-muted hover:text-on-graphite"><ArrowLeft className="h-4 w-4" /> View site</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </main>
  );
}

function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-3xl bg-card p-8 shadow-card">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="text-sm text-muted-foreground">Sign in with your authorized account.</p>
      <input className={field} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={field} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={busy} className={`${btn} w-full bg-primary py-3 text-primary-foreground`}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

const empty = { name: "", category: CATEGORIES[0] as string, price: "", description: "", image_url: "", badge: "", sort_order: "0" };
type Draft = typeof empty;

function Dashboard({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const role = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });
  const products = useQuery(productsQuery);
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);

  if (role.isLoading) return <p className="text-muted-foreground">Checking access…</p>;
  if (!role.data)
    return (
      <div className="rounded-3xl bg-card p-8 shadow-card">
        <p>This account is not authorized to manage products.</p>
        <button onClick={() => supabase.auth.signOut()} className={`${btn} mt-4 bg-graphite text-on-graphite`}>Sign out</button>
      </div>
    );

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button onClick={() => setEditing({ id: null, draft: empty })} className={`${btn} bg-primary text-primary-foreground`}><Plus className="h-4 w-4" /> Add product</button>
          <button onClick={() => supabase.auth.signOut()} className={`${btn} bg-background`}><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </div>
      <div className="space-y-3">
        {products.data?.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-card">
            <img src={p.image_url || mark} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.category} · {formatPrice(Number(p.price))}{p.badge ? ` · ${p.badge}` : ""}</p>
            </div>
            <button aria-label="Edit" onClick={() => setEditing({ id: p.id, draft: { name: p.name, category: p.category, price: String(p.price), description: p.description, image_url: p.image_url, badge: p.badge ?? "", sort_order: String(p.sort_order) } })} className={`${btn} bg-secondary`}><Pencil className="h-4 w-4" /></button>
            <button aria-label="Delete" onClick={() => remove(p)} className={`${btn} bg-secondary text-destructive`}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {products.data?.length === 0 && <p className="text-muted-foreground">No products yet.</p>}
      </div>
      {editing && <Editor id={editing.id} initial={editing.draft} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Editor({ id, initial, onClose }: { id: string | null; initial: Draft; onClose: () => void }) {
  const qc = useQueryClient();
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value });

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const row = { name: d.name, category: d.category, price: Number(d.price) || 0, description: d.description, image_url: d.image_url, badge: d.badge || null, sort_order: Number(d.sort_order) || 0 };
    const { error } = id ? await supabase.from("products").update(row).eq("id", id) : await supabase.from("products").insert(row);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(id ? "Product updated" : "Product added");
    qc.invalidateQueries({ queryKey: ["products"] });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-3xl bg-card p-7">
        <h2 className="text-2xl font-bold">{id ? "Edit product" : "New product"}</h2>
        <input className={field} required placeholder="Name" value={d.name} onChange={set("name")} />
        <div className="grid grid-cols-2 gap-3">
          <select className={field} value={d.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <input className={field} required type="number" step="0.01" min="0" placeholder="Price (AFN)" aria-label="Price in Afghan afghani (AFN)" value={d.price} onChange={set("price")} />
        </div>
        <textarea className={field} rows={3} placeholder="Description" value={d.description} onChange={set("description")} />
        <div className="grid grid-cols-2 gap-3">
          <input className={field} placeholder="Badge (e.g. New)" value={d.badge} onChange={set("badge")} />
          <input className={field} type="number" placeholder="Display order" value={d.sort_order} onChange={set("sort_order")} />
        </div>
        <div className="flex items-center gap-3">
          {d.image_url && <img src={d.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />}
          <label className={`${btn} cursor-pointer bg-secondary`}>
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setD({ ...d, image_url: await fileToDataUrl(f) }); }} />
          </label>
        </div>
        <input className={field} placeholder="…or paste an image link" value={d.image_url.startsWith("data:") ? "" : d.image_url} onChange={set("image_url")} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={`${btn} bg-secondary`}>Cancel</button>
          <button disabled={busy} className={`${btn} bg-primary text-primary-foreground`}>Save</button>
        </div>
      </form>
    </div>
  );
}
