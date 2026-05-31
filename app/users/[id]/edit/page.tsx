"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    code: "",
    email: "",
    password: "",
    role: "TECH",
  });

  // =========================
  // LOAD USER DATA
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setFetching(true);

        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "User not found");
        }

        setForm({
          code: data.code ?? "",
          email: data.email ?? "",
          password: "", // ⚠️ password jamais retourné (sécurité)
          role: data.role ?? "TECH",
        });

      } catch (err) {
        console.error(err);
        alert("Utilisateur introuvable");
        router.push("/users");
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id, router]);

  // =========================
  // UPDATE USER
  // =========================
  const updateUser = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Update failed");
      }

      router.push("/users");

    } catch (err) {
      console.error(err);
      alert("Erreur modification utilisateur");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING UI
  // =========================
  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse">Chargement utilisateur...</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Modifier utilisateur
          </h1>

          <p className="text-slate-400 text-sm">
            Mise à jour du compte
          </p>
        </div>

        <button
          onClick={() => router.push("/users")}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

      </div>

      {/* FORM */}
      <form
        onSubmit={updateUser}
        className="max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
      >

        {/* CODE */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Code utilisateur
          </label>

          <input
            type="text"
            required
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value })
            }
            className="w-full bg-slate-800 rounded-xl px-4 py-3"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Email
          </label>

          <input
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full bg-slate-800 rounded-xl px-4 py-3"
          />
        </div>

        {/* PASSWORD (OPTIONNEL) */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Nouveau mot de passe (optionnel)
          </label>

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full bg-slate-800 rounded-xl px-4 py-3"
            placeholder="laisser vide si inchangé"
          />
        </div>

        {/* ROLE */}
        <div>
          <label className="text-sm text-slate-300 mb-1 block">
            Rôle
          </label>

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
            className="w-full bg-slate-800 rounded-xl px-4 py-3"
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="TECH">Technicien</option>
          </select>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-xl py-3"
        >
          <Save size={18} />

          {loading ? "Sauvegarde..." : "Enregistrer"}
        </button>

      </form>

    </div>
  );
}