"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    code: "",
    email: "",
    role: "TECH",
    active: true,
  });

  // LOAD USER
  useEffect(() => {
    async function fetchUser() {
      try {
        setFetching(true);

        const res = await fetch(`/api/users/${id}`);

        if (!res.ok) {
          throw new Error("User not found");
        }

        const data = await res.json();

        // IMPORTANT: sécuriser les valeurs
        setForm({
          code: data?.code ?? "",
          email: data?.email ?? "",
          role: data?.role ?? "TECH",
          active: data?.active ?? true,
        });
      } catch (err) {
        console.error(err);
        alert("Utilisateur introuvable");
        router.push("/users");
      } finally {
        setFetching(false);
      }
    }

    if (id) fetchUser();
  }, [id, router]);

  // UPDATE USER
  async function updateUser(e: any) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      /*router.push("/users");*/
      router.push(`/users/edit/${id}`)
    } catch (err) {
      alert("Erreur update user");
    } finally {
      setLoading(false);
    }
  }

  // LOADING STATE
  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse">Chargement utilisateur...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Modifier utilisateur</h1>

        <button
          onClick={() => router.push("/users")}
          className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={updateUser}
        className="max-w-xl bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4"
      >
        {/* CODE */}
        <input
          className="w-full bg-slate-800 p-3 rounded-xl"
          placeholder="Code utilisateur"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value })
          }
        />

        {/* EMAIL */}
        <input
          className="w-full bg-slate-800 p-3 rounded-xl"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* ROLE */}
        <select
          className="w-full bg-slate-800 p-3 rounded-xl"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="TECH">Tech</option>
        </select>

        {/* ACTIVE */}
        <select
          className="w-full bg-slate-800 p-3 rounded-xl"
          value={form.active ? "true" : "false"}
          onChange={(e) =>
            setForm({
              ...form,
              active: e.target.value === "true",
            })
          }
        >
          <option value="true">Actif</option>
          <option value="false">Inactif</option>
        </select>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 p-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {loading ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}